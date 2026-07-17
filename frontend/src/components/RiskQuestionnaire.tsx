import { useState } from 'react';
import { calculateRiskProfile } from '../types/riskProfile';
import type { RiskAnswers, RiskConstraints } from '../types/riskProfile';

interface RiskQuestionnaireProps {
  onComplete: (constraints: RiskConstraints) => void;
}

interface Question {
  key: keyof RiskAnswers;
  text: string;
  options: { label: string; value: number }[];
}

const QUESTIONS: Question[] = [
  {
    key: 'horizon',
    text: 'What is your investment horizon?',
    options: [
      { label: 'Less than 1 year', value: 1 },
      { label: '1–5 years', value: 2 },
      { label: '5+ years', value: 3 },
    ],
  },
  {
    key: 'reaction',
    text: 'If your portfolio dropped 20% in a month, what would you do?',
    options: [
      { label: 'Sell immediately', value: 1 },
      { label: 'Hold and wait', value: 2 },
      { label: 'Buy more', value: 3 },
    ],
  },
  {
    key: 'goal',
    text: 'What is your primary investment goal?',
    options: [
      { label: 'Preserve capital', value: 1 },
      { label: 'Balanced growth', value: 2 },
      { label: 'Maximum growth', value: 3 },
    ],
  },
  {
    key: 'experience',
    text: 'How would you describe your investment experience?',
    options: [
      { label: 'Beginner', value: 1 },
      { label: 'Some experience', value: 2 },
      { label: 'Experienced', value: 3 },
    ],
  },
  {
    key: 'incomeStability',
    text: 'How stable is your income?',
    options: [
      { label: 'Unstable/variable', value: 1 },
      { label: 'Stable', value: 2 },
      { label: 'Very stable with surplus', value: 3 },
    ],
  },
];

export default function RiskQuestionnaire({ onComplete }: RiskQuestionnaireProps) {
  const [answers, setAnswers] = useState<Partial<RiskAnswers>>({});

  const handleSelect = (key: keyof RiskAnswers, value: number) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    // If all questions are answered, automatically proceed or allow submission.
    // Check if we now have 5 answered questions
    const keys: (keyof RiskAnswers)[] = ['horizon', 'reaction', 'goal', 'experience', 'incomeStability'];
    const allAnswered = keys.every((k) => newAnswers[k] !== undefined);
    
    if (allAnswered) {
      const completedAnswers = newAnswers as RiskAnswers;
      const constraints = calculateRiskProfile(completedAnswers);
      // Optional small delay for a smooth UI transition feel
      setTimeout(() => {
        onComplete(constraints);
      }, 300);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Risk Profile Assessment</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Answer the following questions to help us tailor constraints for your optimized portfolio.
        </p>

        <div className="space-y-6">
          {QUESTIONS.map((q) => {
            const selectedVal = answers[q.key];
            return (
              <div key={q.key} className="space-y-3">
                <p className="text-sm font-medium text-zinc-300">{q.text}</p>
                <div className="grid grid-cols-3 gap-2">
                  {q.options.map((opt) => {
                    const isSelected = selectedVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(q.key, opt.value)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer text-center ${
                          isSelected
                            ? 'bg-red-950/40 border-red-500 text-red-400 shadow-md shadow-red-900/10'
                            : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
