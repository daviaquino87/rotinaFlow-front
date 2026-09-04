import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@hooks/use-toast";
import { useVerifyCreditPayment } from "@modules/credits/hooks/use-credits";

export function useCalendarActions(refetchCalendar: () => void, refetchCredits: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const verifyCredit = useVerifyCreditPayment();

  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState<number | undefined>(undefined);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingSyncProposalId, setPendingSyncProposalId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handle returning from Stripe credit purchase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const creditSession = params.get("credit_session");
    const cancelled = params.get("credit_cancelled");
    if (creditSession) {
      verifyCredit(creditSession).then((data) => {
        if (data.paid) toast({ title: "Créditos adicionados!", description: `+${data.added} crédito${(data.added ?? 0) > 1 ? "s" : ""} na sua conta.` });
      }).catch(() => {});
      window.history.replaceState({}, "", window.location.pathname);
    } else if (cancelled) {
      toast({ title: "Compra cancelada", description: "Nenhum crédito foi adicionado.", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncMutation = useMutation({
    mutationFn: async ({ proposalUuid, clearBefore }: { proposalUuid: string; clearBefore: boolean }) => {
      const res = await fetch(`/api/schedule/proposals/${proposalUuid}/approve`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearBefore }),
      });
      const body = await res.json();
      if (res.status === 402) { setCreditsRequired(body.required); setShowCreditsModal(true); throw new Error("INSUFFICIENT_CREDITS"); }
      if (!res.ok) throw new Error(body.error || "Erro ao sincronizar");
      return body;
    },
    onSuccess: (data) => {
      toast({ title: "Sincronizado!", description: data.message ?? "Rotina enviada para o Google Agenda." });
      refetchCredits();
      refetchCalendar();
    },
    onError: (err: Error) => {
      if (err.message !== "INSUFFICIENT_CREDITS") toast({ title: "Erro ao sincronizar", description: "Não foi possível sincronizar. Tente novamente.", variant: "destructive" });
    },
  });

  const clearCalendarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/schedule/calendar/events", {
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erro ao limpar agenda");
      return body;
    },
    onSuccess: (data) => {
      toast({ title: "Agenda limpa!", description: data.message ?? "Eventos removidos do Google Agenda." });
      refetchCalendar();
    },
    onError: () => {
      toast({ title: "Erro ao limpar agenda", description: "Não foi possível limpar os eventos. Tente novamente.", variant: "destructive" });
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const res = await fetch(`/api/schedule/proposals/${uuid}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erro ao excluir rotina");
      return body;
    },
    onSuccess: () => {
      toast({ title: "Rotina excluída!" });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/proposals"] });
    },
    onError: () => {
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir a rotina. Tente novamente.", variant: "destructive" });
    },
  });

  const handleOpenSyncModal = (proposalUuid: string) => {
    setPendingSyncProposalId(proposalUuid);
    setShowSyncModal(true);
  };

  const handleSyncConfirm = (clearBefore: boolean) => {
    setShowSyncModal(false);
    if (pendingSyncProposalId !== null) {
      syncMutation.mutate({ proposalUuid: pendingSyncProposalId, clearBefore });
      setPendingSyncProposalId(null);
    }
  };

  const handleClearCalendar = () => {
    setShowClearConfirm(false);
    clearCalendarMutation.mutate();
  };

  return {
    showCreditsModal,
    setShowCreditsModal,
    creditsRequired,
    showSyncModal,
    setShowSyncModal,
    setPendingSyncProposalId,
    showClearConfirm,
    setShowClearConfirm,
    syncMutation,
    clearCalendarMutation,
    deleteProposalMutation,
    handleOpenSyncModal,
    handleSyncConfirm,
    handleClearCalendar,
  };
}
