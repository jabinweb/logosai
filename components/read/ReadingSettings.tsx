'use client';

interface ReadingSettingsProps {
  showSettings: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  fontFamily: 'serif' | 'sans' | 'mono' | 'eczar';
  lineHeight: 'compact' | 'normal' | 'relaxed' | 'loose';
  onFontSizeChange: (size: 'small' | 'medium' | 'large' | 'xl') => void;
  onFontFamilyChange: (family: 'serif' | 'sans' | 'mono' | 'eczar') => void;
  onLineHeightChange: (height: 'compact' | 'normal' | 'relaxed' | 'loose') => void;
  onSettingsToggle: () => void;
}

export default function ReadingSettings({
  showSettings,
  fontSize,
  fontFamily,
  lineHeight,
  onFontSizeChange,
  onFontFamilyChange,
  onLineHeightChange,
  onSettingsToggle
}: ReadingSettingsProps) {
  if (!showSettings) return null;

  return (
    <div className="fixed top-16 right-3 sm:right-6 w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">Reading Settings</h3>
        <button
          onClick={onSettingsToggle}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font</label>
          <div className="space-y-1">
            {(['serif', 'sans', 'mono', 'eczar'] as const).map((fontOption) => (
              <button
                key={fontOption}
                onClick={() => onFontFamilyChange(fontOption)}
                className={`w-full p-2 text-left text-sm rounded-lg transition-colors ${
                  fontFamily === fontOption
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`${
                  fontOption === 'serif' ? 'font-serif' :
                  fontOption === 'sans' ? 'font-sans' :
                  fontOption === 'mono' ? 'font-mono' :
                  'font-eczar'
                }`}>
                  {fontOption === 'serif' ? 'Serif (Traditional)' :
                   fontOption === 'sans' ? 'Sans Serif (Modern)' :
                   fontOption === 'mono' ? 'Monospace (Code-like)' :
                   'Eczar (Hindi Optimized)'}
                </div>
                <div className={`text-xs text-gray-500 dark:text-gray-400 ${
                  fontOption === 'serif' ? 'font-serif' :
                  fontOption === 'sans' ? 'font-sans' :
                  fontOption === 'mono' ? 'font-mono' :
                  'font-eczar'
                }`}>
                  {fontOption === 'eczar' ? 'भजन संहिता - Hindi Bible text' : 'The quick brown fox jumps over the lazy dog.'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
          <div className="grid grid-cols-2 gap-2">
            {(['small', 'medium', 'large', 'xl'] as const).map((sizeOption) => (
              <button
                key={sizeOption}
                onClick={() => onFontSizeChange(sizeOption)}
                className={`p-2 text-center rounded-lg border transition-colors ${
                  fontSize === sizeOption
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`font-medium ${
                  sizeOption === 'small' ? 'text-sm' :
                  sizeOption === 'medium' ? 'text-base' :
                  sizeOption === 'large' ? 'text-lg' :
                  'text-xl'
                }`}>
                  Aa
                </div>
                <div className="text-xs capitalize mt-1">{sizeOption}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line Spacing</label>
          <div className="grid grid-cols-2 gap-2">
            {(['compact', 'normal', 'relaxed', 'loose'] as const).map((spacingOption) => (
              <button
                key={spacingOption}
                onClick={() => onLineHeightChange(spacingOption)}
                className={`p-2 text-center rounded-lg border transition-colors ${
                  lineHeight === spacingOption
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className={`text-xs ${
                    spacingOption === 'compact' ? 'leading-3' :
                    spacingOption === 'normal' ? 'leading-4' :
                    spacingOption === 'relaxed' ? 'leading-5' :
                    'leading-6'
                  }`}>
                    ___<br/>___<br/>___
                  </div>
                  <div className="mt-1 capitalize text-xs">{spacingOption}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reading Tips */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tips</h4>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>• Adjust settings for comfortable reading</p>
            <p>• Use audio player for hands-free listening</p>
            <p>• Swipe left/right to navigate chapters on mobile</p>
            <p>• Click verse numbers to share links</p>
          </div>
        </div>
      </div>
    </div>
  );
}
