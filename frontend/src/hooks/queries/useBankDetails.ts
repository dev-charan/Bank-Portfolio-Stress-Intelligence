import { useQuery } from "@tanstack/react-query";
import { banksAPI } from "@/api/banks.api";

export function useBankDetails(bankId: string, cycle?: string) {
  return useQuery({
    queryKey: ["bank-details", bankId, cycle],
    queryFn: async () => {
      const response = await banksAPI.getBankById(bankId, cycle);
      return response.data;
    },
    enabled: !!bankId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
