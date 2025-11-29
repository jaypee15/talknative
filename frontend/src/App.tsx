import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

interface ChatResponse {
  transcription: string;
  correction: string | null;
  reply: string;
  audio: string;
}

export default function App() {
  const [language, setLanguage] = useState<'yoruba' | 'hausa' | 'igbo'>('yoruba');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ 
    audio: true 
  });

  async function sendAudio() {
    if (!mediaBlobUrl) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await fetch(mediaBlobUrl).then((r) => r.blob());
      const form = new FormData();
      form.append('file', blob, 'audio.webm');

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/chat?language=${language}`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ChatResponse = await res.json();
      setResponse(data);

      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send audio');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    clearBlobUrl();
    setResponse(null);
    setError(null);
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        Language Learning
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select Language:
        </label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as any)}
          style={{ 
            padding: '10px', 
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            minWidth: '200px'
          }}
        >
          <option value="yoruba">Yoruba</option>
          <option value="hausa">Hausa</option>
          <option value="igbo">Igbo</option>
        </select>
      </div>

      <div style={{ 
        padding: '30px', 
        background: '#f5f5f5', 
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Status: <strong>{status}</strong>
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={startRecording}
            disabled={status === 'recording'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: status === 'recording' ? '#ccc' : '#4CAF50',
              color: 'white',
              cursor: status === 'recording' ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎤 Start Recording
          </button>
          
          <button
            onClick={stopRecording}
            disabled={status !== 'recording'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: status !== 'recording' ? '#ccc' : '#f44336',
              color: 'white',
              cursor: status !== 'recording' ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Recording
          </button>
          
          <button
            onClick={sendAudio}
            disabled={!mediaBlobUrl || loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: !mediaBlobUrl || loading ? '#ccc' : '#2196F3',
              color: 'white',
              cursor: !mediaBlobUrl || loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Sending...' : '📤 Send'}
          </button>
          
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '20px', 
          background: '#ffebee', 
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ 
          padding: '30px', 
          background: '#e3f2fd', 
          borderRadius: '12px',
          border: '2px solid #2196F3'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Response</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Your transcription:</strong>
            <p style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '6px',
              margin: '5px 0 0 0'
            }}>
              {response.transcription}
            </p>
          </div>

          {response.correction && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Correction:</strong>
              <p style={{ 
                background: '#fff3e0', 
                padding: '10px', 
                borderRadius: '6px',
                margin: '5px 0 0 0',
                color: '#e65100'
              }}>
                {response.correction}
              </p>
            </div>
          )}

          <div>
            <strong>Tutor's reply:</strong>
            <p style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '6px',
              margin: '5px 0 0 0',
              fontSize: '18px'
            }}>
              {response.reply}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
