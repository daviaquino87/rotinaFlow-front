import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@/api-client";

export interface CreditsData {
  credits: number;
  firstSyncDone: boolean;
  transactions: Array<{
    id: number;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export function useCredits() {
  return useQuery<CreditsData>({
    queryKey: ["credits-balance"],
    queryFn: () => customFetch<CreditsData>("/api/credits/balance"),
    staleTime: 30_000,
  });
}

export function useVerifyCreditPayment() {
  const queryClient = useQueryClient();

  return async (sessionId: string): Promise<{ paid: boolean; added?: number; credits?: number }> => {
    const data = await customFetch<{ paid: boolean; added?: number; credits?: number }>(
      `/api/credits/verify/${sessionId}`,
    );
    if (data.paid) {
      await queryClient.invalidateQueries({ queryKey: ["credits-balance"] });
    }
    return data;
  };
}
