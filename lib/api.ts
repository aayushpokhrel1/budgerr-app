const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8001';

// Single source for the backend API key. Empty string (harmless) when unset,
// e.g. while backend auth is disabled.
export const BUDGERR_API_KEY = process.env.EXPO_PUBLIC_BUDGERR_API_KEY ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      'X-API-Key': BUDGERR_API_KEY,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? res.statusText);
  }
  return res.json();
}

export type BetStatus = 'pending' | 'won' | 'lost' | 'push' | 'cashed_out';
export type BetType = 'single' | 'parlay';

export interface BetLeg {
  leg_id: number;
  player_name: string | null;
  stat_type: string | null;
  line_value: number | null;
  side: string | null;
  odds: number | null;
  leg_status: BetStatus;
  model_prob: number | null;
}

export interface Bet {
  bet_id: number;
  sportsbook: string;
  placed_at: string;
  bet_type: BetType;
  stake: number;
  potential_payout: number;
  status: BetStatus;
  settled_at: string | null;
  net_result: number | null;
  legs: BetLeg[];
  is_paper: boolean;
}

export interface BetLegInput {
  player_name?: string;
  stat_type?: string;
  line_value?: number;
  side?: string;
  odds?: number;
  model_prob?: number | null;
}

export interface BetInput {
  sportsbook: string;
  bet_type: BetType;
  stake: number;
  potential_payout: number;
  placed_at?: string;
  legs?: BetLegInput[];
  is_paper?: boolean;
}

export interface Category {
  category_id: number;
  name: string;
  monthly_limit: number;
  is_betting_category: boolean;
}

export interface BudgetPeriod {
  period_id: number;
  category_id: number;
  month: string;
  spent: number;
  limit: number;
  remaining: number;
}

export interface MonthlyNetResult {
  month: string;
  bet_net_profit: number;
  bets_settled: number;
  bank_net_cash_outflow: number;
}

export interface BestCardOption {
  card_id: number;
  card_name: string;
  multiplier: number;
  capped_out: boolean;
  remaining_cap_room: number | null;
}

export interface BestCardResponse {
  best: BestCardOption | null;
  options: BestCardOption[];
}

export interface Account {
  account_id: number;
  plaid_item_id: string;
  institution_name: string;
  account_type: string;
  mask: string;
  current_balance: number;
}

export interface Transaction {
  txn_id: number;
  account_id: number;
  date: string;
  amount: number;
  merchant_name: string | null;
  plaid_category: string | null;
  custom_category: string | null;
  is_betting: boolean;
}

export interface TransactionFilters {
  start?: string;
  end?: string;
  accountId?: number;
  uncategorizedOnly?: boolean;
  limit?: number;
}

export type AnalyticsScope = 'real' | 'paper';

export interface AnalyticsSummary {
  settled: number;
  wins: number;
  losses: number;
  pushes: number;
  total_staked: number;
  net_profit: number;
  roi: number | null;
}

export interface AnalyticsBreakdown extends AnalyticsSummary {
  key: string;
}

export interface AnalyticsStatType {
  key: string;
  legs: number;
  won: number;
  lost: number;
  pushed: number;
  hit_rate: number | null;
}

export interface CalibrationBucket {
  lo: number;
  hi: number;
  legs: number;
  predicted: number | null;
  actual: number | null;
}

export interface Calibration {
  legs: number;
  overall_predicted: number | null;
  overall_actual: number | null;
  buckets: CalibrationBucket[];
}

export interface BetAnalytics {
  scope: AnalyticsScope;
  overall: AnalyticsSummary;
  by_sportsbook: AnalyticsBreakdown[];
  by_bet_type: AnalyticsBreakdown[];
  by_stat_type: AnalyticsStatType[];
  calibration: Calibration;
}

export interface BankrollPoint {
  date: string;
  net: number;
  cumulative: number;
}

export interface BankrollResponse {
  scope: AnalyticsScope;
  points: BankrollPoint[];
  max_drawdown: number;
  longest_losing_streak: number;
}

export interface ParsedBetLeg {
  player_name: string | null;
  stat_type: string | null;
  line_value: number | null;
  side: string | null;
  odds: number | null;
}

export interface ParsedSlip {
  sportsbook: string | null;
  bet_type: BetType | null;
  stake: number | null;
  potential_payout: number | null;
  legs: ParsedBetLeg[] | null;
  note: string | null;
}

export interface RecurringCharge {
  merchant_name: string;
  last_amount: number;
  avg_amount: number;
  occurrences: number;
  first_date: string;
  last_date: string;
  median_interval_days: number;
  active: boolean;
  monthly_estimate: number;
}

export interface RecurringChargesResponse {
  recurring: RecurringCharge[];
  monthly_total: number;
}

export interface ExpiringRate {
  rate_id: number;
  card_id: number;
  card_name: string;
  category_id: number;
  category_name: string;
  multiplier: number;
  effective_end: string;
  days_left: number;
}

export interface ExpiringRatesResponse {
  expiring: ExpiringRate[];
}

export const api = {
  bets: {
    list: (status?: BetStatus) =>
      request<Bet[]>(`/bets${status ? `?status=${status}` : ''}`),
    create: (bet: BetInput) =>
      request<Bet>('/bets', { method: 'POST', body: JSON.stringify(bet) }),
    settle: (betId: number, status: BetStatus, netResult: number) =>
      request<Bet>(`/bets/${betId}/settle`, {
        method: 'PATCH',
        body: JSON.stringify({ status, net_result: netResult }),
      }),
    trend: (start: string, end: string) =>
      request<{ by_month: MonthlyNetResult[] }>(`/bets/trend?start=${start}&end=${end}`),
    analytics: (scope: AnalyticsScope = 'real') =>
      request<BetAnalytics>(`/bets/analytics?scope=${scope}`),
    bankroll: (scope: AnalyticsScope = 'real') =>
      request<BankrollResponse>(`/bets/bankroll?scope=${scope}`),
    parseSlip: async (file: { uri: string; name: string; type: string }): Promise<ParsedSlip> => {
      const form = new FormData();
      // React Native FormData expects the {uri, name, type} triple rather
      // than a File/Blob instance.
      form.append('file', file as unknown as Blob);
      const res = await fetch(`${API_URL}/bets/parse-slip`, {
        method: 'POST',
        headers: { 'X-API-Key': BUDGERR_API_KEY },
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.detail ?? res.statusText) as Error & { status?: number };
        err.status = res.status;
        throw err;
      }
      return res.json();
    },
  },
  categories: {
    list: () => request<Category[]>('/categories'),
  },
  budgetPeriods: {
    list: (month: string) => request<BudgetPeriod[]>(`/budget-periods?month=${month}`),
    recompute: (month: string) =>
      request<{ budget_periods: BudgetPeriod[] }>(`/budget-periods/recompute?month=${month}`, {
        method: 'POST',
      }),
  },
  rewards: {
    bestCard: (categoryId: number, asOf?: string) =>
      request<BestCardResponse>(
        `/rewards/best-card?category_id=${categoryId}${asOf ? `&as_of=${asOf}` : ''}`
      ),
    expiringRates: (withinDays = 45) =>
      request<ExpiringRatesResponse>(`/rewards/expiring-rates?within_days=${withinDays}`),
  },
  plaid: {
    accounts: {
      list: () => request<Account[]>('/plaid/accounts'),
    },
    recurringCharges: () => request<RecurringChargesResponse>('/plaid/recurring-charges'),
    transactions: {
      list: (filters: TransactionFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.start) params.set('start', filters.start);
        if (filters.end) params.set('end', filters.end);
        if (filters.accountId !== undefined) params.set('account_id', String(filters.accountId));
        if (filters.uncategorizedOnly) params.set('uncategorized_only', 'true');
        if (filters.limit !== undefined) params.set('limit', String(filters.limit));
        const qs = params.toString();
        return request<Transaction[]>(`/plaid/transactions${qs ? `?${qs}` : ''}`);
      },
      categorize: (txnId: number, customCategory: string | null) =>
        request<Transaction>(`/plaid/transactions/${txnId}`, {
          method: 'PATCH',
          body: JSON.stringify({ custom_category: customCategory }),
        }),
    },
    syncTransactions: (itemId: string) =>
      request<{ added: number; modified: number; removed: number }>(
        `/plaid/sync-transactions/${itemId}`,
        { method: 'POST' }
      ),
  },
};
