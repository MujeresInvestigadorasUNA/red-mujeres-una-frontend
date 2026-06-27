"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { askResearchAI } from "@/lib/api/chat";
import { MessageSquare, Send, X, RotateCcw, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "¡Hola! Soy el asistente de la Red de Mujeres Académicas. Puedo ayudarte a encontrar investigaciones, recomendarte contenido según tus intereses o responder preguntas sobre los trabajos publicados. ¿En qué puedo ayudarte?",
  sources: [],
};

export default function AIChat() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map(({ role, content }) => ({ role, content }));

      const res = await askResearchAI({
        question,
        user_id: user?.id ?? user?.user_id,
        history,
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Lo siento, ocurrió un error al procesar tu pregunta. Intenta de nuevo.", sources: [] },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión. Verifica tu conexión e intenta de nuevo.", sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#C0392B] hover:bg-[#831d16] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title="Asistente IA"
        >
          <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #831d16, #E7473C)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Asistente IA</h3>
                <p className="text-[10px] text-white/80">Red de Mujeres Académicas</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewConversation}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Nueva conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : "order-0"}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#C0392B] text-white rounded-br-md"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Sources */}
                  {msg.sources?.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      <span className="text-[10px] text-slate-400 font-medium px-1">Fuentes:</span>
                      {msg.sources.map((source) => (
                        <Link
                          key={source.research_id}
                          href={`/Investigaciones/${source.research_id}`}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-[#C0392B]/30 hover:text-[#C0392B] transition-colors group"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-[#C0392B]" />
                          <span className="truncate">{source.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#C0392B] animate-spin" />
                    <span className="text-xs text-slate-500">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-3 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C0392B]/40 focus:bg-white transition-colors placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-[#C0392B] text-white hover:bg-[#831d16] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
