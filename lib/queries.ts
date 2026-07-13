import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, BetInput, BetStatus } from './api';
import { playstatApi } from './playstat';

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.categories.list });
}

export function useBudgetPeriods(month: string) {
  return useQuery({
    queryKey: ['budget-periods', month],
    queryFn: () => api.budgetPeriods.list(month),
  });
}

export function useBets(status?: BetStatus) {
  return useQuery({ queryKey: ['bets', status ?? 'all'], queryFn: () => api.bets.list(status) });
}

export function useBetsTrend(start: string, end: string) {
  return useQuery({ queryKey: ['bets-trend', start, end], queryFn: () => api.bets.trend(start, end) });
}

export function useBestCard(categoryId: number | null) {
  return useQuery({
    queryKey: ['best-card', categoryId],
    queryFn: () => api.rewards.bestCard(categoryId as number),
    enabled: categoryId !== null,
  });
}

export function useCreateBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bet: BetInput) => api.bets.create(bet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    },
  });
}

export function useSettleBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ betId, status, netResult }: { betId: number; status: BetStatus; netResult: number }) =>
      api.bets.settle(betId, status, netResult),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['bets-trend'] });
    },
  });
}

export function usePlaystatTonightsEdges() {
  return useQuery({ queryKey: ['playstat-edges-tonight'], queryFn: playstatApi.edges.listTonight });
}

export function usePlaystatTonightsGames() {
  return useQuery({ queryKey: ['playstat-games-tonight'], queryFn: playstatApi.games.listTonight });
}
