import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch, type ScheduleEvent } from "@/api-client";
import { DAYS_OF_WEEK } from "@lib/utils";
import { useToast } from "@hooks/use-toast";

export type ProposalWithEvents = {
  uuid: string;
  status: string;
  title?: string;
  events: ScheduleEvent[];
};

export function useProposalEvents(proposalUuid: string) {
  const { toast } = useToast();

  const { data: proposal, isLoading, refetch } = useQuery<ProposalWithEvents>({
    queryKey: ["proposal-by-uuid", proposalUuid],
    queryFn: () => customFetch<ProposalWithEvents>(`/api/schedule/proposals/${proposalUuid}`),
    enabled: Boolean(proposalUuid),
  });

  const [localEvents, setLocalEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDayId, setSelectedDayId] = useState("seg");

  useEffect(() => {
    if (proposal?.events) {
      setLocalEvents(proposal.events);
      const firstDay = DAYS_OF_WEEK.find(d => proposal.events.some(e => e.dayOfWeek === d.id));
      if (firstDay) setSelectedDayId(firstDay.id);
    }
  }, [proposal?.events]);

  const hasUnsavedChanges = JSON.stringify(localEvents) !== JSON.stringify(proposal?.events);

  const handleSaveEvents = () => {
    customFetch(`/api/schedule/proposals/${proposalUuid}/events`, {
      method: "PUT",
      body: JSON.stringify({ events: localEvents }),
    })
      .then(async () => {
        toast({ title: "Salvo!" });
        await refetch();
      })
      .catch(() => {
        toast({ title: "Erro ao salvar", variant: "destructive" });
      });
  };

  const handleSwapTimes = (idA: number, idB: number) => {
    setLocalEvents(prev => {
      const evA = prev.find(e => e.id === idA);
      const evB = prev.find(e => e.id === idB);
      if (!evA || !evB) return prev;
      return prev.map(ev => {
        if (ev.id === idA) return { ...ev, startTime: evB.startTime, endTime: evB.endTime };
        if (ev.id === idB) return { ...ev, startTime: evA.startTime, endTime: evA.endTime };
        return ev;
      });
    });
  };

  const addLocalEvent = (event: ScheduleEvent) => setLocalEvents(prev => [...prev, event]);
  const updateLocalEvent = (event: ScheduleEvent) => setLocalEvents(prev => prev.map(ev => (ev.id === event.id ? event : ev)));
  const deleteLocalEvent = (id: number) => setLocalEvents(prev => prev.filter(ev => ev.id !== id));

  return {
    proposal,
    isLoading,
    refetch,
    localEvents,
    selectedDayId,
    setSelectedDayId,
    hasUnsavedChanges,
    handleSaveEvents,
    handleSwapTimes,
    addLocalEvent,
    updateLocalEvent,
    deleteLocalEvent,
  };
}
