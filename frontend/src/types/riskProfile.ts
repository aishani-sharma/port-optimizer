export interface RiskAnswers {
  horizon: number;
  reaction: number;
  goal: number;
  experience: number;
  incomeStability: number;
}

export type RiskCategory = 'Conservative' | 'Moderate' | 'Aggressive';

export interface RiskConstraints {
  category: RiskCategory;
  maxWeight: number;
  maxVolatility: number | null;
}

export function calculateRiskProfile(answers: RiskAnswers): RiskConstraints {
  const total =
    answers.horizon +
    answers.reaction +
    answers.goal +
    answers.experience +
    answers.incomeStability;

  if (total <= 8) {
    return {
      category: 'Conservative',
      maxWeight: 0.25,
      maxVolatility: 0.15,
    };
  } else if (total <= 12) {
    return {
      category: 'Moderate',
      maxWeight: 0.40,
      maxVolatility: 0.25,
    };
  } else {
    return {
      category: 'Aggressive',
      maxWeight: 0.60,
      maxVolatility: null,
    };
  }
}
