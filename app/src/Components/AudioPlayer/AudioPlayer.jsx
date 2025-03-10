import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayer.css';

const AudioPlayer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
        }
    }, []);

    const togglePlay = () => {
        if (audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div className="audio-player">
            <audio 
                ref={audioRef} 
                src="/Achadubom-chamada.mp3" 
                onEnded={handleEnded}
            />
            <button 
                className={`play-button ${isPlaying ? 'playing' : ''}`} 
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
            >
                {isPlaying ? (
                    <i className="pi pi-pause"></i>
                ) : (
                    <i className="pi pi-play"></i>
                )}
            </button>
        </div>
    );
};

export default AudioPlayer; 