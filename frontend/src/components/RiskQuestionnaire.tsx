import { useState } from 'react';
import { calculateRiskProfile } from '../types/riskProfile';
import type { RiskAnswers, RiskConstraints } from '../types/riskProfile';

interface RiskQuestionnaireProps {
  onComplete: (constraints: RiskConstraints) => void;
}

interface Question {
  key: keyof RiskAnswers;
  text: string;
  subtext: string;
  options: { label: string; value: number }[];
}

const QUESTIONS: Question[] = [
  {
    key: 'horizon',
    text: 'What is your investment horizon?',
    subtext: 'Determines how long your capital can grow and recover from market fluctuations.',
    options: [
      { label: 'Less than 1 year', value: 1 },
      { label: '1–5 years', value: 2 },
      { label: '5+ years', value: 3 },
    ],
  },
  {
    key: 'reaction',
    text: 'If your portfolio dropped 20% in a month, what would you do?',
    subtext: 'Reveals your behavioral tolerance for risk and short-term volatility.',
    options: [
      { label: 'Sell immediately', value: 1 },
      { label: 'Hold and wait', value: 2 },
      { label: 'Buy more', value: 3 },
    ],
  },
  {
    key: 'goal',
    text: 'What is your primary investment goal?',
    subtext: 'Guides the model to prioritize growth potential, capital preservation, or balanced income.',
    options: [
      { label: 'Preserve capital', value: 1 },
      { label: 'Balanced growth', value: 2 },
      { label: 'Maximum growth', value: 3 },
    ],
  },
  {
    key: 'experience',
    text: 'How would you describe your investment experience?',
    subtext: 'Ensures the optimization constraints align with your familiarity with market dynamics.',
    options: [
      { label: 'Beginner', value: 1 },
      { label: 'Some experience', value: 2 },
      { label: 'Experienced', value: 3 },
    ],
  },
  {
    key: 'incomeStability',
    text: 'How stable is your income?',
    subtext: 'Assesses your capacity to absorb investment risk based on reliable external cash flow.',
    options: [
      { label: 'Unstable/variable', value: 1 },
      { label: 'Stable', value: 2 },
      { label: 'Very stable with surplus', value: 3 },
    ],
  },
];

const getOptionIcon = (key: keyof RiskAnswers, value: number) => {
  switch (key) {
    case 'horizon':
      if (value === 1) {
        // Fast time / short horizon (timer/clock)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        );
      } else if (value === 2) {
        // Medium horizon (calendar)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        );
      } else {
        // Long term horizon (hourglass / growth globe)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
          </svg>
        );
      }

    case 'reaction':
      if (value === 1) {
        // Sell immediately (trending down)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286L21 15.75m0 0-3.75 3.75M21 15.75v-3.75" />
          </svg>
        );
      } else if (value === 2) {
        // Hold and wait (pause / balance)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        );
      } else {
        // Buy more (trending up)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307L21 9m0 0-3.75-3.75M21 9v3.75" />
          </svg>
        );
      }

    case 'goal':
      if (value === 1) {
        // Preserve capital (shield)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        );
      } else if (value === 2) {
        // Balanced growth (pie chart)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 07.5 7.5h-7.5V6Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
          </svg>
        );
      } else {
        // Maximum growth (rocket/flame)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.59 2.51a14.98 14.98 0 0 0-6.16 12.12A14.98 14.98 0 0 0 15.59 14.37ZM15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58H9.75M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          </svg>
        );
      }

    case 'experience':
      if (value === 1) {
        // Beginner (open book)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292" />
          </svg>
        );
      } else if (value === 2) {
        // Some experience (chart bar)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
          </svg>
        );
      } else {
        // Experienced (academic cap / trophy star)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-amber-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c0 1.18.337 2.278.92 3.208" />
          </svg>
        );
      }

    case 'incomeStability':
      if (value === 1) {
        // Unstable (wave / signal)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-amber-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      } else if (value === 2) {
        // Stable (equalizer / check shield)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      } else {
        // Very stable with surplus (currency / vault)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      }

    default:
      return null;
  }
};

export default function RiskQuestionnaire({ onComplete }: RiskQuestionnaireProps) {
  const [answers, setAnswers] = useState<Partial<RiskAnswers>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleSelect = (key: keyof RiskAnswers, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    const currentQuestion = QUESTIONS[currentStep];
    const answer = answers[currentQuestion.key];
    
    if (answer === undefined) return;

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const completedAnswers = answers as RiskAnswers;
      const constraints = calculateRiskProfile(completedAnswers);
      onComplete(constraints);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const selectedVal = answers[currentQuestion.key];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const isAnswered = selectedVal !== undefined;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/80 relative overflow-hidden">
        {/* Card Header & Badge */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-8">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-500 bg-red-950/60 border border-red-900/40 px-2.5 py-1 rounded-full">
              Risk Profile Assessment
            </span>
            <p className="text-xs text-zinc-400 mt-2">
              Answer 5 quick questions to set your custom portfolio constraints.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg">
            Step {currentStep + 1} of {QUESTIONS.length}
          </span>
        </div>

        {/* Step Progress Indicator with Connector Line */}
        <div className="relative flex items-center justify-between mb-10 px-3">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-zinc-800/90 rounded-full z-0">
            <div 
              className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out shadow-sm shadow-red-600/50"
              style={{ width: `${(currentStep / (QUESTIONS.length - 1)) * 100}%` }}
            />
          </div>

          {QUESTIONS.map((_, idx) => {
            const isCurrent = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold transition-all duration-300 border-2 ${
                    isCurrent
                      ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 border-red-400 scale-110 ring-4 ring-red-600/20'
                      : isCompleted
                      ? 'bg-red-950 border-red-600 text-red-400 shadow-md shadow-red-950/40'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Question Hero Area */}
        <div className="space-y-6 min-h-[260px]">
          <div className="space-y-2">
            {/* Hero Question Text */}
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {currentQuestion.text}
            </h3>
            {/* Question Context / Muted Gray Subtext */}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal pt-1">
              {currentQuestion.subtext}
            </p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedVal === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(currentQuestion.key, opt.value)}
                  className={`group w-full px-4 py-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-950/40 via-red-950/20 to-zinc-900/80 border-red-500 text-white shadow-lg shadow-red-950/40 ring-1 ring-red-500/40'
                      : 'bg-zinc-900/60 border-zinc-800/90 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Option Icon */}
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'bg-red-600/20 border-red-500/50 text-red-400 shadow-sm'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700'
                      }`}
                    >
                      {getOptionIcon(currentQuestion.key, opt.value)}
                    </div>
                    {/* Option Label */}
                    <span className={`text-sm sm:text-base ${isSelected ? 'font-semibold text-white' : 'font-medium text-zinc-200'}`}>
                      {opt.label}
                    </span>
                  </div>

                  {/* Radio Indicator Circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'border-red-500 bg-red-600 text-white shadow-md shadow-red-600/50 scale-105'
                        : 'border-zinc-700 bg-zinc-950/80 group-hover:border-zinc-600'
                    }`}
                  >
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800/80 mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${
              currentStep === 0
                ? 'opacity-0 cursor-not-allowed border-transparent'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-850 hover:text-zinc-200 cursor-pointer'
            }`}
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!isAnswered}
            className={`px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all duration-200 ${
              isAnswered
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-600/30 border-red-500/50 active:scale-[0.98]'
                : 'bg-zinc-900/80 text-zinc-600 border-zinc-800/80 opacity-50 cursor-not-allowed shadow-none'
            }`}
          >
            {isLastStep ? 'Complete Assessment' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
