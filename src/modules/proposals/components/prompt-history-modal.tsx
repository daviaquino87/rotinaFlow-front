import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useListOpenaiMessages } from "@/api-client";
import { Modal } from "./modal";

// The assistant's raw reply embeds the machine-readable routine as a
// <ROTINA_PROPOSTA> JSON block after a short human sentence — show only that
// sentence here; the JSON itself is already rendered as the timeline.
function stripProposalBlock(content: string) {
  const idx = content.indexOf("<ROTINA_PROPOSTA>");
  const text = idx === -1 ? content : content.slice(0, idx);
  return text.trim();
}

export function PromptHistoryModal({
  open,
  onClose,
  conversationId,
}: {
  open: boolean;
  onClose: () => void;
  conversationId: number | null | undefined;
}) {
  const { t } = useTranslation("proposals");
  const { data: messages, isLoading } = useListOpenaiMessages(conversationId ?? 0, {
    query: { enabled: open && !!conversationId },
  });

  return (
    <Modal isOpen={open} onClose={onClose} title={t("components.promptHistoryModal.title")}>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : !messages || messages.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-10">
          {t("components.promptHistoryModal.noHistory")}
        </p>
      ) : (
        <div className="space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const text = isUser
              ? msg.content
              : stripProposalBlock(msg.content) || t("components.promptHistoryModal.fallbackAssistantText");
            return (
              <div key={msg.id}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  {isUser
                    ? t("components.promptHistoryModal.userLabel")
                    : t("components.promptHistoryModal.assistantLabel")}
                </p>
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
