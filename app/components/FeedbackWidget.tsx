'use client';

import { useState, useEffect } from 'react';

interface FeedbackWidgetProps {
  appId?: string;
  appName?: string;
  triggerAfterActions?: number;
}

export default function FeedbackWidget({ 
  appId = 'pcc-miniapp',
  appName = 'PCC',
  triggerAfterActions = 3 
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const feedbackState = localStorage.getItem(`feedback_${appId}`);
    if (feedbackState) {
      const state = JSON.parse(feedbackState);
      if (state.submitted) {
        setHasSubmitted(true);
      }
      if (state.dismissed && Date.now() - state.dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }

    const actionCount = parseInt(localStorage.getItem(`actions_${appId}`) || '0');
    if (actionCount >= triggerAfterActions && !hasSubmitted && !dismissed) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [appId, triggerAfterActions, hasSubmitted, dismissed]);

  const handleDismiss = () => {
    setIsOpen(false);
    setDismissed(true);
    localStorage.setItem(`feedback_${appId}`, JSON.stringify({
      dismissed: true,
      dismissedAt: Date.now()
    }));
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://feedback-widget-ecru.vercel.app/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          appName,
          rating,
          feedback: feedback.trim() || null,
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setHasSubmitted(true);
        localStorage.setItem(`feedback_${appId}`, JSON.stringify({
          submitted: true,
          submittedAt: Date.now()
        }));
        
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) return null;

  // Floating button - positioned above bottom nav (bottom-20)
  if (!isOpen) {
    if (dismissed) return null;
    
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-[#22c55e] hover:bg-[#16a34a] text-black rounded-full p-2.5 shadow-lg shadow-[#22c55e]/20 z-40 transition-transform hover:scale-110"
        aria-label="Give feedback"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  // Modal - matches PCC dark theme
  return (
    <div className="fixed bottom-20 right-4 w-72 bg-[#111116] rounded-2xl shadow-2xl z-40 overflow-hidden border border-[#222]">
      {/* Header */}
      <div className="bg-[#22c55e] px-4 py-2.5 flex justify-between items-center">
        <span className="font-semibold text-black text-sm">How's {appName}?</span>
        <button onClick={handleDismiss} className="text-black/60 hover:text-black">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {submitted ? (
          <div className="text-center py-3">
            <div className="text-3xl mb-2">🙏</div>
            <p className="text-white text-sm font-medium">Thanks!</p>
          </div>
        ) : (
          <>
            <p className="text-[#888] text-xs mb-3">Rate your experience</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    star <= rating ? 'text-[#22c55e]' : 'text-[#333]'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any suggestions? (optional)"
              className="w-full bg-[#0a0a0f] text-white rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#22c55e] border border-[#222]"
              rows={2}
            />

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full mt-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#333] disabled:cursor-not-allowed text-black font-medium py-2 rounded-xl text-sm transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Export helper to track actions
export function trackFeedbackAction(appId = 'pcc-miniapp') {
  if (typeof window !== 'undefined') {
    const count = parseInt(localStorage.getItem(`actions_${appId}`) || '0');
    localStorage.setItem(`actions_${appId}`, String(count + 1));
  }
}
