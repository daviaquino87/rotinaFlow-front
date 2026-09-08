import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch, type ScheduleEvent } from "@/api-client";

export interface RoutineTemplateSummary {
  uuid: string;
  title: string;
  description: string;
  emoji: string;
  priceCredits: number;
  eventCount: number;
}

export interface RoutineTemplateDetail extends RoutineTemplateSummary {
  events: ScheduleEvent[];
  alreadyPurchased: boolean;
  proposalUuid: string | null;
}

export function useTemplates() {
  return useQuery<RoutineTemplateSummary[]>({
    queryKey: ["templates"],
    queryFn: () => customFetch<RoutineTemplateSummary[]>("/api/templates"),
    staleTime: 60_000,
  });
}

export function useTemplate(uuid: string) {
  return useQuery<RoutineTemplateDetail>({
    queryKey: ["template", uuid],
    queryFn: () => customFetch<RoutineTemplateDetail>(`/api/templates/${uuid}`),
    enabled: Boolean(uuid),
  });
}

export function usePurchaseTemplate() {
  const queryClient = useQueryClient();

  return async (uuid: string): Promise<{ proposalUuid: string }> => {
    const data = await customFetch<{ proposalUuid: string }>(`/api/templates/${uuid}/purchase`, {
      method: "POST",
    });
    await queryClient.invalidateQueries({ queryKey: ["credits-balance"] });
    await queryClient.invalidateQueries({ queryKey: ["template", uuid] });
    return data;
  };
}
