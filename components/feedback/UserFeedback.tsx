'use client';

import React, { useState } from 'react';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  XMarkIcon as XMarkIconSolid
} from '@heroicons/react/24/solid';

interface UserFeedbackProps {
  query: string;
  response: string;
  language: string;
  onFeedbackSubmitted?: () => void;
}

const UserFeedback: React.FC<UserFeedbackProps> = ({
  query,
  response,
  language,
  onFeedbackSubmitted
}) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | 'incorrect' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [customFeedback, setCustomFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitFeedbackToAPI = async (feedbackData: {
    query: string;
    response: string;
    language: string;
    userFeedback: 'helpful' | 'not_helpful' | 'incorrect';
    category?: string;
    customFeedback?: string;
  }) => {
    const response = await fetch('/api/training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }

    return response.json();
  };

  const handleFeedbackClick = async (type: 'helpful' | 'not_helpful' | 'incorrect') => {
    setFeedback(type);
    if (type === 'helpful') {
      // For helpful feedback, submit immediately
      setIsSubmitting(true);
      try {
        await submitFeedbackToAPI({
          query,
          response,
          language,
          userFeedback: type,
          category: undefined,
          customFeedback: undefined,
        });

        setSubmitted(true);
        onFeedbackSubmitted?.();
        
        // Auto-hide after success
        setTimeout(() => {
          setSubmitted(false);
          setFeedback(null);
          setShowDetails(false);
          setCategory('');
          setCustomFeedback('');
        }, 3000);
      } catch (error) {
        console.error('Error submitting feedback:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For negative feedback, show details form
      setShowDetails(true);
    }
  };

  const submitFeedback = async () => {
    if (!feedback) return;

    setIsSubmitting(true);
    try {
      await submitFeedbackToAPI({
        query,
        response,
        language,
        userFeedback: feedback,
        category: category || undefined,
        customFeedback: customFeedback || undefined,
      });

      setSubmitted(true);
      onFeedbackSubmitted?.();
      
      // Auto-hide after success
      setTimeout(() => {
        setSubmitted(false);
        setFeedback(null);
        setShowDetails(false);
        setCategory('');
        setCustomFeedback('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Thanks for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sticky Feedback Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 text-blue-500" />
              Rate this response
            </h4>
            {showDetails && (
              <button
                onClick={() => {setShowDetails(false); setFeedback(null);}}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {!showDetails ? (
            /* Quick Feedback Buttons */
            <div className="flex space-x-2">
              <button
                onClick={() => handleFeedbackClick('helpful')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  feedback === 'helpful'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-green-50 hover:text-green-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-green-900/20'
                }`}
                disabled={isSubmitting}
              >
                <HandThumbUpIcon className="h-4 w-4 mr-1" />
                Helpful
              </button>
              
              <button
                onClick={() => handleFeedbackClick('not_helpful')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  feedback === 'not_helpful'
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-yellow-50 hover:text-yellow-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-yellow-900/20'
                }`}
                disabled={isSubmitting}
              >
                <HandThumbDownIcon className="h-4 w-4 mr-1" />
                Poor
              </button>
              
              <button
                onClick={() => handleFeedbackClick('incorrect')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  feedback === 'incorrect'
                    ? 'bg-red-100 text-red-700 border-2 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20'
                }`}
                disabled={isSubmitting}
              >
                <XMarkIconSolid className="h-4 w-4 mr-1" />
                Wrong
              </button>
            </div>
          ) : (
            /* Detailed Feedback Form */
            <div className="space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category (optional)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  <option value="theology">Theology & Doctrine</option>
                  <option value="prayer">Prayer & Worship</option>
                  <option value="history">Biblical History</option>
                  <option value="interpretation">Scripture Interpretation</option>
                  <option value="practical">Practical Christian Living</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {feedback !== 'helpful' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {feedback === 'incorrect' 
                      ? 'What was wrong?' 
                      : 'How can we improve?'
                    }
                  </label>
                  <textarea
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    placeholder={
                      feedback === 'incorrect'
                        ? 'Please describe what was incorrect...'
                        : 'Please suggest improvements...'
                    }
                    className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={submitFeedback}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                  ) : (
                    'Submit'
                  )}
                </button>
                <button
                  onClick={() => {setShowDetails(false); setFeedback(null);}}
                  className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => {setShowDetails(false); setFeedback(null);}}
        />
      )}
    </>
  );
};

export default UserFeedback;
