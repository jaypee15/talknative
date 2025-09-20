import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type LanguageOption = 'ig' | 'yo' | 'ha'

export const App: React.FC = () => {
  const [language, setLanguage] = useState<LanguageOption>('ig')
  const [sessionId, setSessionId] = useState<string>(crypto.randomUUID())
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const apiBase = useMemo(() => '/api/v1', [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  async function sendMessage() {
    const text = input.trim()
    if (!text) return
    setIsLoading(true)
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    try {
      const res = await fetch(`${apiBase}/chat/${language}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply ?? '' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error contacting server.' }])
    } finally {
      setIsLoading(false)
    }
  }

  async function resetSession() {
    try {
      await fetch(`${apiBase}/chat/${language}/session/${sessionId}`, { method: 'DELETE' })
    } catch {}
    setSessionId(crypto.randomUUID())
    setMessages([])
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'Inter, system-ui, Arial' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>TalkNative</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={language} onChange={e => setLanguage(e.target.value as LanguageOption)}>
            <option value="ig">Igbo</option>
            <option value="yo">Yoruba</option>
            <option value="ha">Hausa</option>
          </select>
          <button onClick={resetSession}>New session</button>
          {userEmail ? (
            <>
              <span style={{ color: '#555' }}>{userEmail}</span>
              <button onClick={() => supabase.auth.signOut()}>Sign out</button>
            </>
          ) : (
            <button onClick={async () => {
              const email = prompt('Enter email for magic link login:')
              if (!email) return
              await supabase.auth.signInWithOtp({ email })
              alert('Check your email for a magic link')
            }}>Sign in</button>
          )}
        </div>
      </header>
      <main style={{ marginTop: 16, border: '1px solid #eee', borderRadius: 8, padding: 12, minHeight: 320 }}>
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>Say hi to start practicing. Your tutor will reply.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? '#e6f0ff' : '#f6f6f6',
                padding: 10,
                borderRadius: 8,
                maxWidth: '85%'
              }}>
                {m.text}
              </div>
            ))}
          </div>
        )}
      </main>
      <form onSubmit={e => { e.preventDefault(); sendMessage() }} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}


