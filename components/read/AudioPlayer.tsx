'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  text: string;
  bookName: string;
  chapter: string;
  language?: string; // 'en' for English, 'hi' for Hindi
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({ text, bookName, chapter, language = 'en', onPlayStateChange }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const versesRef = useRef<string[]>([]);

  // Initialize voices and verses
  useEffect(() => {
    // Parse verses from text
    const verses = text.split(/(?=\d+\s)/).filter(v => v.trim());
    versesRef.current = verses;

    // Get available voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Debug: Log available Hindi voices
      const hindiVoices = voices.filter(voice => 
        voice.lang.startsWith('hi') || 
        voice.lang.includes('hi-') ||
        voice.lang.includes('Hindi') ||
        voice.name.toLowerCase().includes('hindi') ||
        voice.name.toLowerCase().includes('india') ||
        voice.lang === 'hi-IN'
      );
      
      console.log('Language:', language);
      console.log('All available voices:', voices.length);
      console.log('Available Hindi voices:', hindiVoices.length, hindiVoices.map(v => `${v.name} (${v.lang})`));
      console.log('Sample text:', text.substring(0, 100));
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [text, language]);

  // Initialize selectedVoice when availableVoices change
  useEffect(() => {
    if (availableVoices.length > 0 && !selectedVoice) {
      // Set default voice based on language
      let defaultVoice: SpeechSynthesisVoice | null = null;
      
      if (language === 'hi') {
        // For Hindi content, look for Hindi voices first
        defaultVoice = availableVoices.find(voice => 
          voice.lang === 'hi-IN' || 
          voice.lang === 'hi' || 
          voice.lang.startsWith('hi-') ||
          voice.name.toLowerCase().includes('hindi')
        ) || null;
      }
      
      // Fallback to first English voice or first available voice
      if (!defaultVoice) {
        defaultVoice = availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0] || null;
      }
      
      setSelectedVoice(defaultVoice);
    }
  }, [availableVoices, language, selectedVoice]);

  const playAudio = () => {
    if (isPaused && utteranceRef.current) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      onPlayStateChange?.(true);
      return;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();

    const fullText = versesRef.current.join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    
    // Set language FIRST - this is crucial for Hindi
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }
    
    // Use the selected voice directly
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using selected voice:', selectedVoice.name, selectedVoice.lang);
    } else if (language === 'hi') {
      // Fallback: try to find a Hindi voice if none selected
      const hindiVoice = availableVoices.find(voice => 
        voice.lang === 'hi-IN' || 
        voice.lang === 'hi' || 
        voice.lang.startsWith('hi-') ||
        voice.name.toLowerCase().includes('hindi')
      );
      
      if (hindiVoice) {
        utterance.voice = hindiVoice;
        console.log('Using Hindi voice:', hindiVoice.name, hindiVoice.lang);
      } else {
        // No Hindi voice available - warn user
        console.warn('No Hindi voice found. Hindi text will be read with English pronunciation.');
        alert('No Hindi voice installed on your system. The text will be read with English pronunciation. To hear proper Hindi pronunciation, please install Hindi language support in your browser/system settings.');
      }
    }
    
    // Set speech properties
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0; // Use default pitch
    utterance.volume = 1;

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      onPlayStateChange?.(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentVerse(0);
      onPlayStateChange?.(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onPlayStateChange?.(false);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Estimate current verse based on character position
        const progress = event.charIndex / fullText.length;
        const estimatedVerse = Math.floor(progress * versesRef.current.length);
        setCurrentVerse(estimatedVerse);
      }
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const pauseAudio = () => {
    speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
    onPlayStateChange?.(false);
  };

  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerse(0);
    onPlayStateChange?.(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM8.5 8.7a.7.7 0 0 1 1.4 0v6.6a.7.7 0 0 1-1.4 0zm3-1.2a.7.7 0 0 1 1.4 0v9a.7.7 0 0 1-1.4 0zm3-1.5a.7.7 0 0 1 1.4 0v12a.7.7 0 0 1-1.4 0z"/>
          </svg>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Audio Bible - {bookName} {chapter} {language === 'hi' ? '(हिंदी)' : '(English)'}
          </span>
        </div>
        
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Progress indicator */}
      {isPlaying && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentVerse / Math.max(versesRef.current.length - 1, 1)) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Verse {currentVerse + 1} of {versesRef.current.length}
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isPlaying && !isPaused && (
          <button
            onClick={playAudio}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Play Chapter</span>
          </button>
        )}

        {isPlaying && (
          <button
            onClick={pauseAudio}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={playAudio}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Resume</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={stopAudio}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Advanced Controls */}
      {showControls && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Playback Speed: {playbackSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1x</span>
              <span>2x</span>
            </div>
          </div>

          {availableVoices.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice Selection {language === 'hi' ? '(Hindi/हिंदी)' : '(English)'}
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  if (voice) {
                    setSelectedVoice(voice);
                    // If currently playing, restart with new voice
                    if (isPlaying && !isPaused) {
                      stopAudio();
                      setTimeout(() => playAudio(), 100);
                    }
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {availableVoices
                  .filter(voice => language === 'hi' ? 
                    (voice.lang.startsWith('hi') || voice.lang.includes('hi-') || voice.name.toLowerCase().includes('hindi')) :
                    voice.lang.startsWith('en')
                  )
                  .map((voice, index) => (
                    <option key={`${voice.name}-${voice.lang}-${index}`} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
              </select>
              
              {language === 'hi' && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      const hindiVoices = availableVoices.filter(voice => 
                        voice.lang === 'hi-IN' || 
                        voice.lang === 'hi' || 
                        voice.lang.startsWith('hi-') ||
                        voice.name.toLowerCase().includes('hindi')
                      );
                      
                      alert(`Hindi Voices Available: ${hindiVoices.length}\n\n` +
                            `Hindi voices found:\n${hindiVoices.map(v => `${v.name} (${v.lang})`).join('\n') || 'None'}\n\n` +
                            `Total voices: ${availableVoices.length}\n\n` +
                            `To get proper Hindi pronunciation, install Hindi language pack in Windows Settings > Time & Language > Language > Add a language > Hindi.`);
                    }}
                    className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Check Hindi Voice Support
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
