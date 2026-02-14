import { useQuery } from "@tanstack/react-query";
import { banksAPI } from "@/api/banks.api";
import { BanksListParams } from "@/types/bank.types";

export function useBanks(params: BanksListParams = {}) {
  return useQuery({
    queryKey: ["banks", params],
    queryFn: () => banksAPI.getBanks(params),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useBankDetail(id: string) {
  return useQuery({
    queryKey: ["bank", id],
    queryFn: () => banksAPI.getBankById(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBankStats(id: string, cycle?: string) {
  return useQuery({
    queryKey: ["bank-stats", id, cycle],
    queryFn: () => banksAPI.getBankStats(id, cycle),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
