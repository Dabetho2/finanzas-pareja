function AudioToggle({ isMuted, onToggle }) {
  return (
    <button className="audio-toggle" onClick={onToggle} type="button">
      {isMuted ? '🔇 Activar audio' : '🔊 Silenciar audio'}
    </button>
  );
}

export default AudioToggle;