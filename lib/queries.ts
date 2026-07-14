import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, BetInput, BetStatus, TransactionFilters } from './api';
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

export function usePlaystatSlate() {
  return useQuery({ queryKey: ['playstat-slate'], queryFn: playstatApi.slate.next });
}

export function usePlaystatAllEdges() {
  return useQuery({ queryKey: ['playstat-edges', 'all'], queryFn: playstatApi.edges.list });
}

export function usePlaystatEdges(date: string | undefined) {
  return useQuery({
    queryKey: ['playstat-edges', date],
    queryFn: () => playstatApi.edges.listForDate(date!),
    enabled: !!date,
  });
}

export function usePlaystatGamePredictions(date: string | undefined) {
  return useQuery({
    queryKey: ['playstat-game-predictions', date],
    queryFn: () => playstatApi.gamePredictions.listForDate(date!),
    enabled: !!date,
  });
}

export function usePlaystatParlays() {
  return useQuery({ queryKey: ['playstat-parlays'], queryFn: () => playstatApi.parlays.list() });
}

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: api.plaid.accounts.list });
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api.plaid.transactions.list(filters),
  });
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ txnId, customCategory }: { txnId: number; customCategory: string | null }) =>
      api.plaid.transactions.categorize(txnId, customCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
    },
  });
}

export function useSyncTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.plaid.syncTransactions(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
    },
  });
}

export function useRecomputeBudgetPeriods() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => api.budgetPeriods.recompute(month),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-periods'] }),
  });
}
