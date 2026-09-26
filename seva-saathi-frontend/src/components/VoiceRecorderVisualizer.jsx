import React, { useEffect, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Radio } from "lucide-react";

export default function VoiceRecorderVisualizer({
  isListening,
  onStartListening,
  onStopListening,
  liveTranscript,
  language = "en-IN",
  isSpeaking = false,
  onStopSpeaking
}) {
  const [waveHeights, setWaveHeights] = useState([12, 24, 18, 30, 16, 28, 20, 14]);

  // Animate soundwaves when recording
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setWaveHeights([
          Math.floor(Math.random() * 26) + 8,
          Math.floor(Math.random() * 32) + 12,
          Math.floor(Math.random() * 24) + 10,
          Math.floor(Math.random() * 36) + 14,
          Math.floor(Math.random() * 28) + 8,
          Math.floor(Math.random() * 34) + 12,
          Math.floor(Math.random() * 22) + 10,
          Math.floor(Math.random() * 20) + 6,
        ]);
      }, 120);
    } else {
      setWaveHeights([10, 16, 12, 20, 14, 18, 12, 8]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  if (!isListening && !isSpeaking) {
    return null;
  }

  return (
    <div className={`voiceOverlayBar ${isListening ? "listeningMode" : "speakingMode"}`}>
      
      {/* Status icon & label */}
      <div className="voiceStatusLeft">
        <div className="voicePulseDot">
          {isListening ? (
            <span className="liveDot" />
          ) : (
            <Volume2 size={18} className="speakingIcon" />
          )}
        </div>
        <div className="voiceStatusMeta">
          <strong>
            {isListening ? "Listening to your voice..." : "SevaSathi AI is speaking..."}
          </strong>
          <small>
            {isListening
              ? "Speak naturally about your course, family income, or state"
              : "Click the speaker button to mute voice response"}
          </small>
        </div>
      </div>

      {/* Dynamic Sound Waves */}
      <div className="soundwaveBars" title="Audio frequency visualization">
        {waveHeights.map((h, i) => (
          <span
            key={i}
            className="waveBar"
            style={{
              height: `${isListening ? h : Math.max(6, h * 0.7)}px`,
              transition: "height 0.12s ease"
            }}
          />
        ))}
      </div>

      {/* Live transcript text if available */}
      {isListening && liveTranscript && (
        <div className="liveTranscriptBubble">
          "{liveTranscript}"
        </div>
      )}

      {/* Control Actions */}
      <div className="voiceControlsRight">
        {isListening ? (
          <button 
            className="voiceActionBtn doneListeningBtn" 
            onClick={onStopListening}
            title="Done speaking"
          >
            <MicOff size={16} />
            <span>Done & Search</span>
          </button>
        ) : (
          <button 
            className="voiceActionBtn muteVoiceBtn" 
            onClick={onStopSpeaking}
            title="Mute Speech"
          >
            <VolumeX size={16} />
            <span>Mute Voice</span>
          </button>
        )}
      </div>

    </div>
  );
}
