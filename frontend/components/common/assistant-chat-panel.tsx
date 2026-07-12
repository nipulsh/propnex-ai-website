"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your PropNex AI assistant. Ask me about agents, call logs, billing, lead reactivation, or how to get started.",
};

function getAssistantReply(message: string): string {
  const text = message.toLowerCase();

  if (text.includes("agent")) {
    return "You can create and manage voice agents from the Agents page. Each agent can be assigned a phone number and customized with scripts, voice profiles, and languages.";
  }

  if (text.includes("credit") || text.includes("billing") || text.includes("plan")) {
    return "Your remaining credits are shown in the top navbar. Visit Billing to view usage, upgrade your plan, or purchase additional credit packs.";
  }

  if (text.includes("call") || text.includes("log")) {
    return "Call Logs shows all inbound and outbound interactions. You can filter by date range, agent, and status, then export records as CSV.";
  }

  if (text.includes("lead") || text.includes("reactivat")) {
    return "Lead Reactivation helps you re-engage dormant contacts with automated AI outreach. Filter leads by inactivity, assign an agent, and launch a campaign from that page.";
  }

  if (text.includes("phone") || text.includes("number")) {
    return "Phone Numbers lets you manage lines with separate inbound and outbound agent routing. View call analytics, configure routing, and track activity from the Phone Numbers page.";
  }

  if (text.includes("csv") || text.includes("upload") || text.includes("import")) {
    return "Use Upload CSV to bulk-import contacts. Map your columns to contact name, phone number, and agent ID, then preview and validate before importing.";
  }

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return "Hello! How can I help you with PropNex AI today?";
  }

  return "I can help with agents, phone numbers, call logs, billing, lead reactivation, and CSV imports. What would you like to know?";
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isUser ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-propnex-accent/15 text-propnex-accent">
          <Bot className="size-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-propnex-accent text-propnex-bg"
            : "border border-propnex-border bg-propnex-panel text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

export function AssistantChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages, isTyping]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const reply = getAssistantReply(trimmed);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Sparkles />
        Assistant
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 border-propnex-border bg-propnex-bg p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 border-b border-propnex-border px-5 py-4">
            <div className="flex items-center gap-3 pr-8">
              <div className="flex size-10 items-center justify-center rounded-xl bg-propnex-accent/15 text-propnex-accent">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0 text-left">
                <SheetTitle className="text-foreground">
                  PropNex AI Assistant
                </SheetTitle>
                <SheetDescription>
                  Ask anything about your voice AI workspace.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="propnex-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping ? (
              <div className="flex gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-propnex-accent/15 text-propnex-accent">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-propnex-border bg-propnex-panel px-3.5 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-propnex-muted [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-propnex-muted [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-propnex-muted [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="shrink-0 border-t border-propnex-border p-4"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question..."
                disabled={isTyping}
                autoFocus={open}
                className="h-10 flex-1 border-propnex-border bg-propnex-panel text-foreground placeholder:text-propnex-muted"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="size-10 shrink-0 bg-propnex-accent text-propnex-bg hover:bg-propnex-accent/90"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
