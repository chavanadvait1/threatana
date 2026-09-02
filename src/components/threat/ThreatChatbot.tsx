import { useEffect, useRef, useState } from "react";
import { Bot, Send, User2, Sparkles } from "lucide-react";
import { answer } from "@/lib/remediation";

interface Msg {
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = [
  "Many failed admin logins",
  "Port scan from outside",
  "Large upload to unknown cloud",
  "How do I handle low level threats?",
];

const GREETING: Msg = {
  role: "bot",
  text: "SOC Assistant online. Describe an alert in plain words and I'll explain what it means and how to fix it — I'm tuned for low and medium severity triage.",
};

function Rendered({ text }: { text: string }) {
  return (
    <div className="space-y-1">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        const bold = /^\*\*(.+?)\*\*(.*)$/.exec(line);
        if (bold) {
          return (
            <p key={i} className="text-neon-cyan font-semibold">
              {bold[1]}
              <span className="text-muted-foreground font-normal">{bold[2]}</span>
            </p>
          );
        }
        return (
          <p key={i} className="text-foreground/90">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function ThreatChatbot() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    const reply = answer(text);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: reply }]);
      setThinking(false);
      inputRef.current?.focus();
    }, 600);
  };

  const sendRef = useRef(send);
  sendRef.current = send;

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      sendRef.current(detail);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.addEventListener("soc-assistant-ask", handler);
    return () => window.removeEventListener("soc-assistant-ask", handler);
  }, []);

  return (
    <section ref={sectionRef} className="panel p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <Bot className="text-neon-green" size={22} />
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          SOC Assistant{" "}
          <span className="text-muted-foreground font-normal text-base">
            (plain-language triage &amp; remediation)
          </span>
        </h2>
      </div>

      <div
        ref={scroller}
        className="h-72 overflow-y-auto rounded-md bg-background/50 border border-panel-border p-4 space-y-4 text-sm"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "bot" && (
              <div className="mt-0.5 shrink-0 rounded-md border border-neon-green/40 bg-neon-green/10 p-1.5">
                <Bot size={14} className="text-neon-green" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-md px-3 py-2 leading-relaxed ${
                m.role === "user"
                  ? "bg-neon-blue/15 border border-neon-blue/40"
                  : "bg-panel/60 border border-panel-border"
              }`}
            >
              <Rendered text={m.text} />
            </div>
            {m.role === "user" && (
              <div className="mt-0.5 shrink-0 rounded-md border border-neon-blue/40 bg-neon-blue/10 p-1.5">
                <User2 size={14} className="text-neon-blue" />
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Sparkles size={12} className="text-neon-green animate-pulse" />
            analyzing indicators...
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-panel-border text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/50 transition"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex items-center gap-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about an alert, e.g. 'brute force on admin account'"
          className="flex-1 bg-background/60 border border-panel-border rounded-md px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-neon-green/50"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-neon-green/15 border border-neon-green/50 text-neon-green font-medium hover:bg-neon-green/25 transition disabled:opacity-50"
        >
          <Send size={15} />
          Send
        </button>
      </form>
    </section>
  );
}
