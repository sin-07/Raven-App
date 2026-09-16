'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeOfConductProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const CodeOfConduct: React.FC<CodeOfConductProps> = ({ isOpen, onClose, onAccept }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLDivElement;
    // Check if scrolled to bottom (within 10px tolerance)
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 10;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      toast.success('✓ You can now accept the Code of Conduct', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        }
      });
    }
  };

  const handleAccept = () => {
    if (!agreedToTerms) {
      return;
    }
    onAccept();
    onClose();
  };

  if (!isOpen) return null;

  const codeOfConductPoints = [
    "IT IS EITHER BY YOU OR FOR YOU.",
    "THERE IS NO GAIN WITHOUT PAIN.",
    "NO CELEBRATIONS ON ANY SPECIAL OCCASIONS.",
    "A MYTHO-TECHNICAL INSTITUTION STRESSING ON NOT BELIEVING ANY BELIEFS UNLESS IT'S METHODOLOGICALLY RATIONALISED.",
    "IT IS ALWAYS GOOD TO HAVE EXPERT'S ADVICE. SO, ASK YOURSELF.",
    "IF CRITICISED, STAY GROUNDED AND PROVE THE CRITIC WRONG, NO MATTER HOW LONG IT TAKES, OR HOW TOUGH IT SEEMS.",
    "THERE HAS TO BE A MID WAY, IF EXTREMES PERTURB YOU. FIND IT, IF YOU WISH.",
    "TALKING IS BETTER TO BE LEFT FOR THE POLITICS. BE A COMMON MAN, AND WORK WITH BOTH WAYS.",
    "NO MATTER WHAT WAS DONE BY YOU IN PAST. WHAT MATTERS IS THAT YOU STILL HAVE TIME AND, LIFE TOO.",
    "IF FACING ANYTHING, IT IS OBVIOUS TO GET OFF TRACKS BY SOMETIMES. TAKE NOTE OF THAT AND USE BRAIN TO SENSE REALITY.",
    "BEND IF EVERYTHING GETS TIGHTER.",
    "BE MINDFUL ABOUT THE WORDS, DEEDS AND ACTS OF HUMAN EMOTIONS.",
    "STABLE CHAOS AND CHAOTIC STABILITY BUILD THE UNIVERSE."
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-700 p-8 rounded-t-lg relative shadow-lg">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/90 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
              <span className="text-white/90 text-xs font-semibold tracking-wider">OFFICIAL DOCUMENT</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
              RAVEN CODE OF CONDUCT
            </h2>
            <div className="w-24 h-1 bg-white/30 mx-auto mb-3"></div>
            <p className="text-red-50 text-base font-medium">
              Principles & Values for RAVEN LLC Members
            </p>
          </div>
        </div>

        {/* Scrollable Content with Preamble */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-4"
          onScroll={handleScroll}
        >
          {/* Preamble inside scrollable area */}
          <div className="mb-6 bg-gradient-to-b from-red-50 to-white rounded-lg p-5 shadow-sm border-2 border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-1 h-full bg-red-600 rounded-full flex-shrink-0"></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📜</span> Preamble
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed text-justify font-medium">
                  THE FOLLOWING DRAFT CONTAINS CERTAIN CODES OF CONDUCT FOR RAVEN LLC. 
                  IN CASE OF CERTAIN CEREBRAL CONFLICTS, THE SAME MUST BE BROUGHT OUT 
                  INTO THE CORDIAL MEETING DECIDING THE COUNSEL MEMBER ATTENDANCE OF 
                  THE CO-ASSOCIATES OF RAVEN LLC. ONCE DECLARED IN GENERAL, THESE CODES 
                  OF CONDUCT MUST BE KEPT IN MIND BY ALL. HAVING CO-ASSOCIATES OF FUTURE, 
                  THE SAME MUST BE COMMUNICATED FROM THE ONSET. IT WOULD BE THE 
                  SOLE LIABILITY OF THE CO-ASSOCIATES TO UPHOLD THE DIGNITY OF THE 
                  CODES OF CONDUCT FOR THE BETTER GOOD OF THE COMPANY.
                </p>
              </div>
            </div>
          </div>

          {/* Code of Conduct Points */}
          <div className="space-y-3">
            {codeOfConductPoints.map((point, index) => (
              <div 
                key={index}
                className="flex gap-4 p-4 bg-white border-l-4 border-red-500 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-red-600"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed font-medium text-sm pt-1">
                  {point}
                </p>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent py-4 text-center">
              <p className="text-sm text-red-600 font-semibold animate-bounce">
                ↓ Please scroll down to read all points ↓
              </p>
            </div>
          )}
        </div>

        {/* Footer with checkbox and buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
          {/* Agreement checkbox */}
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className={`text-sm leading-relaxed ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700 group-hover:text-gray-900'}`}>
                I have read and understood the <strong>RAVEN Code of Conduct</strong>. 
                I agree to abide by these principles and uphold the dignity of the institution.
              </span>
            </label>
          </div>

          {/* Warning message */}
          {!hasScrolledToBottom && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>You must scroll to the bottom</strong> and read all the Code of Conduct points before you can proceed with admission.
              </p>
            </div>
          )}

          {!agreedToTerms && hasScrolledToBottom && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                ⚠️ <strong>You must accept the Code of Conduct</strong> to proceed with admission and payment.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={!agreedToTerms}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                agreedToTerms
                  ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              I Understand & Accept
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeOfConduct;

