import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
}

// Type definitions
export type Language = 'yoruba' | 'hausa' | 'igbo'
export type Proficiency = 'beginner' | 'intermediate' | 'advanced'

export interface UserProfile {
  id: string
  email: string
  target_language: Language | null
  proficiency_level: Proficiency | null
  created_at: string
}

export interface Scenario {
  id: string
  language: Language
  title: string
  difficulty: string
  description?: string
}

export interface ConversationStart {
  conversation_id: string
  initial_ai_greeting?: string
  initial_ai_audio_url?: string
}

export interface TurnResponse {
  turn_number: number
  transcription: string
  ai_text: string
  ai_audio_url: string
  correction: string | null
  grammar_score: number | null
}

// API functions
export async function updateUserProfile(
  target_language: Language,
  proficiency_level: Proficiency
): Promise<UserProfile> {
  const response = await apiRequest('/api/v1/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_language, proficiency_level }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to update profile')
  }
  
  return response.json()
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiRequest('/api/v1/user/profile')
  
  if (!response.ok) {
    throw new Error('Failed to get profile')
  }
  
  return response.json()
}

export async function getScenarios(): Promise<Scenario[]> {
  const response = await apiRequest('/api/v1/scenarios')
  
  if (!response.ok) {
    throw new Error('Failed to get scenarios')
  }
  
  return response.json()
}

export async function startConversation(scenarioId: string): Promise<ConversationStart> {
  const response = await apiRequest('/api/v1/chat/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to start conversation')
  }
  
  return response.json()
}

export async function sendTurn(
  conversationId: string,
  audioBlob: Blob
): Promise<TurnResponse> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  
  const response = await apiRequest(`/api/v1/chat/${conversationId}/turn`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Failed to send turn')
  }
  
  return response.json()
}
