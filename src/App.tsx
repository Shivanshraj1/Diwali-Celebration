import { useState, useCallback } from 'react';
import { CountdownDiwali } from './components/CountdownDiwali';
import { CrackerArena } from './components/CrackerArena';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const [phase, setPhase] = useState<'countdown' | 'arena'>('countdown');
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMute(next);
      return next;
    });
  }, []);

  return (
    <main className="w-screen h-screen bg-black overflow-hidden font-sans">
      {phase === 'countdown' ? (
        <CountdownDiwali
          onEnterTerrace={() => {
            soundEngine.startAtmosphere();
            setPhase('arena');
          }}
        />
      ) : (
        <CrackerArena
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onReplayGreeting={() => setPhase('countdown')}
        />
      )}
    </main>
  );
}
