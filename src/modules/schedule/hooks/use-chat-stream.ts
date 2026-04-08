import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetOpenaiConversationQueryKey } from "@/api-client";

export function useChatStream(conversationId: number | undefined) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = useCallback(async (content: string, overrideConvId?: number) => {
    const convId = overrideConvId ?? conversationId;
    if (!convId) return;

    setIsStreaming(true);
    setCurrentStream("");
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("request-failed");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.done) {
                break;
              } else if (data.content) {
                streamText += data.content;
                setCurrentStream(streamText);
              }
            } catch {
              // Ignore malformed SSE chunks silently in production
            }
          }
        }
      }

      queryClient.invalidateQueries({
        queryKey: getGetOpenaiConversationQueryKey(convId)
      });

    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      if (!isAbort) {
        setError("Ocorreu um erro ao processar a resposta. Tente novamente.");
      }
    } finally {
      setIsStreaming(false);
      setCurrentStream("");
      abortControllerRef.current = null;
    }
  }, [conversationId, queryClient]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    sendMessage,
    isStreaming,
    currentStream,
    error,
    stopStream
  };
}
