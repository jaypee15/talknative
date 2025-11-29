# Language-Specific System Prompts

This document explains the language-specific AI tutor prompts implemented for Yoruba, Hausa, and Igbo.

## Overview

Each language now has its own specialized system prompt that guides the AI to:
1. Focus on language-specific grammar rules
2. Identify common learner mistakes for that language
3. Provide culturally appropriate responses
4. Use proper orthography and tone marks

## Implementation

### Architecture

```python
# app/ai/agent.py

SYSTEM_PROMPTS = {
    "yoruba": "...",
    "hausa": "...",
    "igbo": "..."
}

def get_agent(language: str) -> Agent:
    """Returns language-specific agent"""
    system_prompt = SYSTEM_PROMPTS.get(language)
    return Agent('google-gla:gemini-2.5-flash', 
                 result_type=ConversationTurn,
                 system_prompt=system_prompt)
```

### Usage

```python
# In chat endpoint
agent = get_agent(language)  # "yoruba", "hausa", or "igbo"
result = await agent.run([...])
```

## Language-Specific Details

### Yoruba 🇳🇬

**Focus Areas:**
- **Tone accuracy** - High (á), mid (a), low (à) tones change meanings
- **Vowel harmony** - Oral vs nasal vowels must harmonize
- **Cultural greetings** - Time-based and context-appropriate
- **Verb serialization** - Proper ordering of multiple verbs

**Common Mistakes:**
- Tone errors: `ọmọ` (child) vs `ọmọ́` (offspring)
- Missing diacritics
- Wrong verb order in serial constructions
- Vowel harmony violations in compounds

**Example Correction:**
```
User says: "Mo wa ile" (wrong tone)
AI corrects: "The correct pronunciation is 'Mo wá ilé' with high tones on 'wá' and 'lé'"
```

### Hausa 🇳🇬

**Focus Areas:**
- **Grammatical gender** - All nouns are masculine or feminine
- **Grade system** - 7 verb grades showing direction/voice
- **Aspect markers** - na/ina (continuous), za (future), etc.
- **Pronoun agreement** - Must match gender

**Common Mistakes:**
- Gender agreement: `kyakkyawan yarinya` (good girl) - kyakkyawan must be feminine
- Grade confusion: using wrong grade for context
- Aspect errors: `na/ina` vs `za` confusion
- Wrong pronoun for gender

**Example Correction:**
```
User says: "Kyakkyawan yarinya" (wrong gender agreement)
AI corrects: "Use feminine form: 'Kyakkyawar yarinya' (kyakkyawar agrees with feminine yarinya)"
```

### Igbo 🇳🇬

**Focus Areas:**
- **Tone patterns** - High, low, and downstep affect meaning
- **Vowel harmony** - Strict rules throughout words
- **Serial verb constructions** - Complex verb sequences
- **Noun class prefixes** - Must use correct markers

**Common Mistakes:**
- Tone errors causing meaning changes
- Vowel harmony violations (mixing incompatible vowels)
- Wrong verb ordering
- Missing noun class markers
- Improper stative verb usage

**Example Correction:**
```
User says: "O na-eje ulo" (vowel harmony error)
AI corrects: "Vowel harmony rule: use 'ụlọ' not 'ulo' (o-group vowels: o, ọ, u, ụ must harmonize)"
```

## Prompt Structure

Each prompt follows this structure:

1. **Role Definition** - "You are a native [Language] tutor..."
2. **Focus Areas** - Key grammatical/tonal features to emphasize
3. **Common Mistakes** - What learners typically struggle with
4. **Instructions** - How to transcribe, correct, and respond
5. **Cultural Context** - Appropriate expressions and usage

## Benefits

### 1. **Improved Error Detection**
- Each agent knows what to look for in its specific language
- Better at catching language-specific mistakes

### 2. **Better Pedagogical Feedback**
- Corrections focus on what matters for each language
- Examples are more relevant

### 3. **Cultural Appropriateness**
- Yoruba agent knows elaborate greeting protocols
- Hausa agent uses Islamic greetings appropriately
- Igbo agent incorporates proverbs and community expressions

### 4. **Accurate Transcription**
- Each agent knows proper orthography for its language
- Correct use of tone marks and diacritics

## Testing

### Test Each Language
```bash
# Test Yoruba
python backend/scripts/poc_chain.py audio.webm yoruba

# Test Hausa
python backend/scripts/poc_chain.py audio.webm hausa

# Test Igbo
python backend/scripts/poc_chain.py audio.webm igbo
```

### Compare Responses
Record the same audio in each language and compare:
- Accuracy of transcription
- Relevance of corrections
- Cultural appropriateness
- Teaching quality

## Prompt Maintenance

### When to Update Prompts

1. **User feedback** - If learners report incorrect corrections
2. **Native speaker review** - Get feedback from native speakers
3. **Common patterns** - If you notice recurring issues
4. **Cultural updates** - As language usage evolves

### How to Update

1. Edit `SYSTEM_PROMPTS` dict in `app/ai/agent.py`
2. Test with sample audio files
3. Deploy (no code changes needed, just prompt text)

### A/B Testing

You could implement A/B testing by creating alternate prompts:

```python
SYSTEM_PROMPTS_V2 = {
    "yoruba": "...",  # Alternative prompt
}

# Toggle in config
USE_PROMPT_VERSION = "v1"  # or "v2"
```

## Future Enhancements

### 1. **Difficulty Levels**
Add beginner/intermediate/advanced prompts:
```python
SYSTEM_PROMPTS = {
    "yoruba": {
        "beginner": "Focus on basic greetings and simple phrases...",
        "intermediate": "Focus on tone accuracy and verb constructions...",
        "advanced": "Focus on idiomatic expressions and proverbs..."
    }
}
```

### 2. **Topic-Specific Prompts**
Different prompts for different conversation topics:
- Greetings
- Shopping
- Family
- Business

### 3. **Regional Variations**
Add support for dialects:
```python
SYSTEM_PROMPTS = {
    "yoruba": {
        "standard": "...",
        "ijesha": "...",  # Ijesha dialect
        "ekiti": "..."    # Ekiti dialect
    }
}
```

## Performance Impact

- **No latency impact** - Prompts are loaded at agent creation
- **Minimal memory** - Just text strings in memory
- **Easy to cache** - Agents can be cached per language

## Best Practices

1. **Be specific** - Detail exact rules and common errors
2. **Give examples** - Show right vs wrong in the prompt
3. **Stay focused** - Each language has 3-4 main focus areas
4. **Cultural context** - Include appropriate cultural guidance
5. **Iterate** - Update based on real learner interactions

## Validation Checklist

- [ ] Native speaker review for each language
- [ ] Test with beginner, intermediate, advanced learners
- [ ] Verify tone mark accuracy in transcriptions
- [ ] Check cultural appropriateness of responses
- [ ] Ensure corrections are clear and helpful
- [ ] Compare against generic prompt performance

---

**Implementation Date**: November 29, 2025  
**Languages Supported**: Yoruba, Hausa, Igbo  
**Model**: Gemini 2.5 Flash via Pydantic AI
