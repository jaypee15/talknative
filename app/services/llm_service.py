import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from app.core.config import settings, LanguageCode

os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY

# In-memory store for ConversationChain instances (not the history itself anymore)
# Key: (session_id, language_code_value)
# Value: ConversationChain instance
active_chains = {}

def get_system_prompt_template(language_code: LanguageCode) -> str:
    # This is a critical part. These prompts will define the AI's persona and teaching style.
    # Start with a basic one for Igbo. This needs significant refinement and collaboration with linguistic experts.
    if language_code == LanguageCode.IGBO:
        return (
            "You are 'Talk Native Igbo Tutor', a patient and encouraging AI language tutor for Igbo. "
            "Your primary goal is to help the user practice conversational Igbo. "
            "Use simple Igbo vocabulary and sentence structures, suitable for a beginner. "
            "When the user makes a mistake in Igbo, gently correct them and explain the correction briefly in English. "
            "If the user asks a question in English, answer it concisely in English and then try to guide them back to practicing Igbo. "
            "You can introduce new vocabulary or simple grammar concepts contextually during the conversation. "
            "Keep your responses relatively short and focused on a single learning point or conversational turn. "
            "Encourage the user to speak/type in Igbo as much as possible. "
            "If the user says 'Kedu?', respond appropriately in Igbo and ask a follow-up question in Igbo. "
            "If the user says 'bye' or 'goodbye', respond in Igbo and end the conversation politely. "
            "Focus on practical, everyday conversation topics like greetings, introductions, family, food, and basic activities."
        )
    elif language_code == LanguageCode.YORUBA: # Placeholder
        return "You are 'Talk Native Yoruba Tutor'..." # To be defined
    elif language_code == LanguageCode.HAUSA: # Placeholder
        return "You are 'Talk Native Hausa Tutor'..." # To be defined
    else: # Default/English - for testing or if language not supported yet
        return "You are a helpful assistant."


def get_chat_chain(session_id: str, language_code: LanguageCode) -> ConversationChain:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured.")

    chain_key = (session_id, language_code.value)

    if chain_key in active_chains:
        return active_chains[chain_key]

    # LLM
    llm = ChatGoogleGenerativeAI(
        temperature=0.7,
        model="models/gemini-2.0-flash",
    )

    # Prompt
    system_prompt_content = get_system_prompt_template(language_code)
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(system_prompt_content),
        MessagesPlaceholder(variable_name="history"),
        HumanMessagePromptTemplate.from_template("{input}")
    ])

    # Persistent Memory with Redis
    # Each session_id + language_code combination gets its own history in Redis
    redis_session_key = f"chat_history:{session_id}:{language_code.value}"
    message_history = RedisChatMessageHistory(
        url=settings.REDIS_URL, session_id=redis_session_key
    )

    # ConversationBufferMemory now uses RedisChatMessageHistory as its chat_memory store
    memory = ConversationBufferMemory(
        memory_key="history", # Default, but good to be explicit
        chat_memory=message_history,
        return_messages=True
    )


    conversation = ConversationChain(
        llm=llm,
        prompt=prompt,
        memory=memory,
        verbose=True # Set to False in production unless debugging
    )
    
    active_chains[chain_key] = conversation
    return conversation

async def get_llm_response(session_id: str, language_code: LanguageCode, user_message: str) -> str:
    chain = get_chat_chain(session_id, language_code)
    try:
        response_data = await chain.ainvoke({"input": user_message})
        ai_reply = response_data.get("response", "Sorry, I could not process your request.")
    except Exception as e:
        print(f"Error during LLM call for session {session_id}, lang {language_code.value}: {e}")
        # Optionally, clear the specific chain instance from active_chains if it's corrupted
        # clear_active_chain_instance(session_id, language_code) # Implement this if needed
        raise  # Re-raise the exception to be caught by the endpoint
    return ai_reply

def clear_chat_history_and_active_chain(session_id: str, language_code: LanguageCode):
    # 1. Clear from active_chains dictionary (in-memory Python object)
    chain_key = (session_id, language_code.value)
    if chain_key in active_chains:
        del active_chains[chain_key]
        print(f"Cleared active chain instance for session: {session_id}, language: {language_code.value}")

    # 2. Clear the history from Redis
    if not settings.REDIS_URL:
        print("REDIS_URL not configured. Cannot clear Redis history.")
        return

    redis_session_key = f"chat_history:{session_id}:{language_code.value}"
    try:
        # Directly delete the key from Redis.
        # This requires a direct Redis client, or using RedisChatMessageHistory's clear() method
        # if we instantiate it just for this purpose.
        
        # Option A: Instantiate history just to clear (simpler with existing LangChain class)
        temp_history_to_clear = RedisChatMessageHistory(
            url=settings.REDIS_URL, session_id=redis_session_key
        )
        temp_history_to_clear.clear()
        print(f"Cleared Redis chat history for key: {redis_session_key}")

        # Option B: Direct Redis client (more efficient if you have a global client)
        # import redis
        # r = redis.Redis.from_url(settings.REDIS_URL)
        # r.delete(redis_session_key)
        # print(f"Cleared Redis chat history for key: {redis_session_key}")

    except Exception as e:
        print(f"Error clearing Redis history for {redis_session_key}: {e}")