import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

const FUNCTIONS_BASE = (import.meta as any).env?.VITE_SUPABASE_FUNCTIONS_URL || '/functions/v1';

export function VoiceInput() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const closeConnection = useCallback(() => {
    console.log('🔴 Closing WebSocket connection...');
    
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {
      console.error('Error closing audio context:', e);
    }

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => {
          t.stop();
          console.log('🛑 Track stopped:', t.label);
        });
        mediaStreamRef.current = null;
      }
    } catch (e) {
      console.error('Error stopping media stream:', e);
    }

    try {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } catch (e) {
      console.error('Error closing WebSocket:', e);
    }

    setConnected(false);
  }, []);

  const startVoiceAssistant = useCallback(async () => {
    try {
      console.log('🚀 Starting Voice Assistant (WebSocket)...');
      setError(null);

      // 1) Get ephemeral key from Edge Function
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      if (!token) throw new Error('no auth token');

      const r = await fetch(`${FUNCTIONS_BASE}/openai-realtime-token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (!r.ok) {
        const errorText = await r.text();
        throw new Error(`Token error ${r.status}: ${errorText}`);
      }
      
      const data = await r.json();
      const apiKey = data.apiKey;
      const model = data.model || 'gpt-4o-realtime-preview-2024-12-17';
      
      if (!apiKey) throw new Error('missing API key');

      console.log('✅ Got API key:', apiKey.substring(0, 20) + '...');
      console.log('📦 Model:', model);

      // 2) Connect WebSocket with API key
      const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`;
      console.log('🔗 Connecting to:', url);
      
      const ws = new WebSocket(url, [
        'realtime',
        `openai-insecure-api-key.${apiKey}`
      ]);
      wsRef.current = ws;

      ws.addEventListener('open', async () => {
        setConnected(true);
        console.log('🔌 WebSocket connected');
        
        // Send session.update
        const sessionUpdate = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful voice assistant for a point-of-sale system. Help users and answer questions concisely.',
            tools: [],
          }
        };
        console.log('📤 Sending session.update');
        ws.send(JSON.stringify(sessionUpdate));

        // 3) Setup microphone with AudioContext (for PCM16)
        console.log('🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        console.log('✅ Microphone access granted');

        // Create audio context for processing
        const audioContext = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Convert Float32 to Int16 PCM
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            
            // Send as base64
            const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64
            }));
          }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        console.log('🎙️ Audio processing started');
      });

      ws.addEventListener('message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('📨 Message:', msg.type);
          
          if (msg.type === 'error') {
            console.error('❌ OpenAI error:', msg.error);
            setError(msg.error.message || 'OpenAI error');
          } else if (msg.type === 'response.audio.delta') {
            // Audio output from AI - would need to decode and play
            console.log('🎵 Received audio delta');
          } else if (msg.type === 'response.audio_transcript.delta') {
            console.log('📝 Transcript:', msg.delta);
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      });

      ws.addEventListener('error', (err) => {
        console.error('❌ WebSocket error:', err);
        setError('Connection error');
      });

      ws.addEventListener('close', (e) => {
        console.log('🔌 WebSocket closed:', e.code, e.reason);
        closeConnection();
      });

    } catch (err) {
      console.error('❌ Error starting voice assistant:', err);
      setError(err instanceof Error ? err.message : String(err));
      closeConnection();
    }
  }, [closeConnection]);

  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, [closeConnection]);

  return (
    <div className="p-4 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">🎤 Voice Assistant</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={startVoiceAssistant}
          disabled={connected}
          variant={connected ? 'secondary' : 'default'}
          size="sm"
        >
          <Mic className="mr-2 h-4 w-4" />
          {connected ? 'Connected' : 'Start Voice Chat'}
        </Button>

        <Button
          onClick={closeConnection}
          disabled={!connected}
          variant="destructive"
          size="sm"
        >
          <MicOff className="mr-2 h-4 w-4" />
          Stop
        </Button>
      </div>

      {connected && (
        <div className="mt-4 p-3 bg-green-500/10 text-green-700 dark:text-green-300 rounded-lg text-sm">
          ✅ Voice assistant active - speak now!
        </div>
      )}
      
      <p className="mt-4 text-xs text-muted-foreground">
        Note: This is a simplified demo. Full audio playback requires additional WebAudio API setup.
      </p>
    </div>
  );
}
