import React, { useState, useEffect, useRef } from "react";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useGetOpenaiConversation,
  useCreateScheduleProposal,
} from "@/api-client";
import { useChatStream } from "@/hooks/use-chat-stream";
import { Button, Input, Card, Skeleton } from "@/components/ui-elements";
import { Send, Plus, MessageSquare, CalendarPlus, User, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [activeConvId, setActiveConvId] = useState<number | undefined>();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useLocation();

  // Queries
  const { data: conversations, refetch: refetchConvs } = useListOpenaiConversations();
  const { data: activeConversation, isLoading: isLoadingConv } = useGetOpenaiConversation(activeConvId || 0);

  // Mutations
  const createConv = useCreateOpenaiConversation();
  const createProposal = useCreateScheduleProposal();
  
  // Custom Hook for SSE stream
  const { sendMessage, isStreaming, currentStream } = useChatStream(activeConvId);

  // Auto-select first conversation or create one
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    } else if (conversations?.length === 0 && !createConv.isPending && !activeConvId) {
      handleNewConversation();
    }
  }, [conversations]);

  // Scroll to bottom when messages change or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, currentStream]);

  const handleNewConversation = () => {
    createConv.mutate({ data: { title: "Nova conversa " + format(new Date(), 'HH:mm') } }, {
      onSuccess: (data) => {
        setActiveConvId(data.id);
        refetchConvs();
      }
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming || !activeConvId) return;
    
    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const handleGenerateProposal = () => {
    if (!activeConvId) return;
    // Assuming the backend extracts userId from session
    createProposal.mutate(
      { data: { conversationId: activeConvId, userId: "current", events: [] } },
      {
        onSuccess: (proposal) => {
          setLocation(`/proposal/${proposal.uuid}`);
        }
      }
    );
  };

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar for Conversations */}
      <div className="w-72 border-r border-slate-100 bg-slate-50/50 flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-slate-100">
          <Button 
            onClick={handleNewConversation} 
            className="w-full bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            variant="outline"
            isLoading={createConv.isPending}
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Conversa
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all text-sm truncate flex items-center gap-3",
                activeConvId === conv.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "hover:bg-slate-200 text-slate-600"
              )}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">{conv.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white z-10 shrink-0">
          <div>
            <h2 className="font-display font-semibold text-lg text-slate-800">
              {activeConversation?.title || "Assistente IA"}
            </h2>
            <p className="text-xs text-slate-500">Conte sobre sua rotina e objetivos</p>
          </div>
          
          {activeConversation?.messages && activeConversation.messages.length > 2 && (
            <Button 
              onClick={handleGenerateProposal}
              isLoading={createProposal.isPending}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 rounded-full"
              size="sm"
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Gerar Proposta
            </Button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {isLoadingConv ? (
            <div className="space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="w-48 h-4" />
                    <Skeleton className="w-96 h-20 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeConversation?.messages?.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-50">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2 text-slate-800">Olá! Como posso ajudar a organizar sua semana?</h3>
                  <p className="text-sm text-slate-500">Tente dizer: "Trabalho das 9h às 18h e quero adicionar 3 treinos na academia e tempo para ler um livro."</p>
                </div>
              )}

              {activeConversation?.messages?.map((msg) => (
                <div key={msg.id} className={cn("flex gap-4 max-w-4xl mx-auto", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'user' ? "bg-slate-100" : "bg-gradient-to-br from-primary to-blue-500"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-slate-500" /> : <Sparkles className="w-5 h-5 text-white" />}
                  </div>
                  <div className={cn(
                    "px-6 py-4 rounded-2xl shadow-sm max-w-[80%]",
                    msg.role === 'user' 
                      ? "bg-slate-100 text-slate-800 rounded-tr-sm" 
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                  )}>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex gap-4 max-w-4xl mx-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                     <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-6 py-4 rounded-2xl shadow-sm bg-white border border-slate-100 text-slate-700 rounded-tl-sm max-w-[80%] min-h-[60px]">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {currentStream}
                      <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Descreva sua rotina ou peça uma mudança..."
                className="pr-14 h-14 rounded-2xl text-base bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-primary shadow-inner"
                disabled={isStreaming || !activeConvId}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!inputValue.trim() || isStreaming || !activeConvId}
                className="absolute right-2 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-center text-[11px] text-slate-400 mt-3">
              A IA pode cometer erros. Revise a proposta gerada antes de sincronizar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
