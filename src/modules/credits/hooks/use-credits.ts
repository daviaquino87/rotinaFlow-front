import { useQuery, useQueryClient } from "@tanstack/react-query";

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
    queryFn: async () => {
      const res = await fetch("/api/credits/balance", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch credits");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useVerifyCreditPayment() {
  const queryClient = useQueryClient();

  return async (sessionId: string): Promise<{ paid: boolean; added?: number; credits?: number }> => {
    const res = await fetch(`/api/credits/verify/${sessionId}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to verify payment");
    const data = await res.json();
    if (data.paid) {
      await queryClient.invalidateQueries({ queryKey: ["credits-balance"] });
    }
    return data;
  };
}
