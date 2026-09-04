import { useEffect, useState } from "react";
import { ApiError, customFetch } from "@/api-client";
import { useToast } from "@hooks/use-toast";
import { useCredits, useVerifyCreditPayment } from "@modules/credits/hooks/use-credits";

export function useProposalSync(proposalUuid: string, refetchProposal: () => void) {
  const { toast } = useToast();
  const { data: creditsData, refetch: refetchCredits } = useCredits();
  const verifyCredit = useVerifyCreditPayment();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState<number | undefined>(undefined);

  // Handle returning from Stripe credit purchase
  useEffect(() => {
    const searchParams = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const creditSession = searchParams.get("credit_session");
    const creditCancelled = searchParams.get("credit_cancelled");

    if (creditSession) {
      verifyCredit(creditSession)
        .then((data) => {
          if (data.paid) {
            toast({
              title: "Créditos adicionados!",
              description: `+${data.added} crédito${(data.added ?? 0) > 1 ? "s" : ""} na sua conta.`,
            });
            refetchCredits();
          }
        })
        .catch(() => {});
      window.history.replaceState({}, "", `/proposal/${proposalUuid}`);
    } else if (creditCancelled) {
      toast({
        title: "Compra cancelada",
        description: "Nenhum crédito foi adicionado.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", `/proposal/${proposalUuid}`);
    }
    // Runs once per proposal load — reads the URL directly, not react-router state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalUuid]);

  const handleApprove = () => {
    if (isSyncing) return;
    setShowSyncModal(true);
  };

  const handleSyncConfirm = async (clearBefore: boolean) => {
    setShowSyncModal(false);
    setIsSyncing(true);
    try {
      const body = await customFetch<{ createdCount: number }>(
        `/api/schedule/proposals/${proposalUuid}/approve`,
        { method: "POST", body: JSON.stringify({ clearBefore }) },
      );
      toast({
        title: "Sincronizado!",
        description: `${body.createdCount} eventos adicionados ao Google Agenda.`,
      });
      refetchProposal();
      refetchCredits();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setCreditsRequired((err.data as { required?: number } | null)?.required);
        setShowCreditsModal(true);
        return;
      }
      if (err instanceof ApiError) {
        toast({
          title: "Erro ao sincronizar",
          description: "Não foi possível sincronizar. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro ao sincronizar", variant: "destructive" });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    creditsData,
    isSyncing,
    showSyncModal,
    setShowSyncModal,
    showCreditsModal,
    setShowCreditsModal,
    creditsRequired,
    handleApprove,
    handleSyncConfirm,
  };
}
