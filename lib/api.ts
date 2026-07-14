const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
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
  },
  plaid: {
    accounts: {
      list: () => request<Account[]>('/plaid/accounts'),
    },
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
