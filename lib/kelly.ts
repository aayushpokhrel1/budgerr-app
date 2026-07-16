// Quarter-Kelly stake sizing for a parlay recommendation.
//
// This is guidance only, not a recommendation to bet the suggested amount —
// it's only as meaningful as the underlying model_prob is calibrated. Check
// the Analytics page's calibration section before treating this as anything
// more than a rough sizing hint.
//
// b = decimal payout odds minus 1 (the "b" in the classic Kelly formula)
// p = joint probability of the parlay hitting
// f = full-Kelly fraction of bankroll to stake (can be <= 0 if there's no edge)
// suggested = quarter of full Kelly, applied to the remaining budget
export function quarterKelly(combinedOdds: number, jointProb: number, remainingBudget: number): {
  f: number;
  suggested: number;
} {
  const b = combinedOdds - 1;
  const p = jointProb;
  if (b <= 0) return { f: 0, suggested: 0 };

  const f = (b * p - (1 - p)) / b;
  if (f <= 0 || remainingBudget <= 0) return { f, suggested: 0 };

  return { f, suggested: 0.25 * f * remainingBudget };
}
