"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon, 
  ArrowLeft, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Wrench,
  Flame,
  Info
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { parseComplaintText } from '@/lib/ai-simulator';
import { POPULAR_MODELS, ChatMessage, DEFAULT_SYSTEM_PROMPT } from '@/lib/chat-types';

export default function ChatbotPage() {
  const { currentUser, complaints, submitComplaint, addToast } = useApp();
  const selectedModel = POPULAR_MODELS[0].id;
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState<boolean | null>(null);

  // Check Gemini API configuration on load.
  useEffect(() => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => {
        setGeminiConnected(Boolean(data.online));
      })
      .catch(() => setGeminiConnected(false));
  }, []);

  if (currentUser.role === 'technician') {
    return (
      <div className="flex flex-col h-screen bg-black text-zinc-100 p-6 items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto">
            <Wrench className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400">
              Technician Workspace Active
            </span>
            <h1 className="text-xl font-bold text-white">Chatbot Not Needed for Technicians</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Field repair technicians do not require conversational triage. Your workspace is focused on executing assigned work orders and critical priority repairs.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/incidents"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Go to Assigned Work Orders</span>
            </Link>
            <Link
              href="/priority"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>View Priority Tasks</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initialMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    content: `Hello! I am **CampusMI AI Assistant** powered by **Google Gemini**.

I take your inputs directly to:
1. **Report & triage incidents** from natural language descriptions (e.g., *"Water pipe burst in Hostel C 3rd floor washroom"* or *"Sparking circuit in LT2"*).
2. **Query complaint statuses** and priority rationale (P1 to P5).
3. **Analyze maintenance health** and campus asset risks.

How can I assist you today?`,
    timestamp: Date.now(),
    model: selectedModel
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const lower = userText.toLowerCase();
    const isReportingIssue = 
      lower.includes('leak') || lower.includes('broken') || lower.includes('smoke') || 
      lower.includes('spark') || lower.includes('not working') || lower.includes('damaged') || 
      lower.includes('water') || lower.includes('repair') || lower.includes('stuck') ||
      lower.includes('hostel') || lower.includes('block') || lower.includes('lt') ||
      lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet') ||
      lower.includes('network') || lower.includes('speed') || lower.includes('slow') ||
      lower.includes('connectivity') || lower.includes('register') || lower.includes('issue') ||
      lower.includes('problem') || lower.includes('complaint') || lower.includes('room') ||
      lower.includes('ac') || lower.includes('light') || lower.includes('fan');

    let triageContext: string | undefined = undefined;

    if (isReportingIssue) {
      // Build conversation context from recent user messages to handle multi-turn answers
      const recentUserContext = messages
        .filter(m => m.role === 'user')
        .slice(-2)
        .map(m => m.content)
        .join('. ');
      const combinedAnalysisText = recentUserContext ? `${recentUserContext}. ${userText}` : userText;

      let classifyData: any = null;
      try {
        const classifyRes = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: combinedAnalysisText }),
        });
        if (classifyRes.ok) {
          classifyData = await classifyRes.json();
        }
      } catch {
        // Fallback if classify route failed
      }

      // If info is incomplete, the AI asks for missing details instead of creating a bogus ticket.
      if (classifyData && classifyData.is_complete === false) {
        const clarificationMsg = classifyData.clarification_question || 
          `I can help register this **${classifyData.category || 'maintenance'}** issue (**${classifyData.title || 'Report'}**), but I need a few more details to dispatch a technician:\n\n• **Missing Details:** ${classifyData.missing_info || 'Building/hostel and room number'}\n\nPlease reply with your hostel/building name and room or specific area so I can submit your work order!`;

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: clarificationMsg,
          timestamp: Date.now(),
          model: selectedModel
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // Information is complete — parse and register the official ticket!
      const aiTitle = classifyData?.title;
      const detectedLoc = classifyData?.location;
      const detectedRoom = classifyData?.room;

      const parsed = parseComplaintText(combinedAnalysisText, detectedLoc, detectedRoom, complaints);

      const submitted = submitComplaint({
        description: userText,
        location_id: detectedLoc || parsed.location_id,
        location_type: parsed.location_type,
        room_or_area: detectedRoom || parsed.room_or_area,
        ai_title: aiTitle,
      });

      triageContext = `### ✅ Incident Automatically Registered & Triaged!
- **Assigned Ticket ID:** \`${submitted.report_id}\`
- **Issue Title:** **${submitted.problem_type}** *(classified by Google Gemini)*
- **Category Detected:** **${submitted.category}**
- **Location Structured:** **${submitted.location_id}** ${submitted.room_or_area ? `(${submitted.room_or_area})` : ''}
- **Context Priority:** **P${submitted.ground_truth_priority}** (${submitted.ground_truth_priority >= 4 ? '🔥 High Hazard' : 'Routine / Moderate'})
- **Triage Reason:** *${submitted.priority_reason}*

${parsed.probable_duplicates.length > 0 ? `⚠️ **Cluster Notice:** Grouped with existing active work order (Ticket #${parsed.probable_duplicates[0].report_id}) to prevent dispatch redundancy.` : '✨ This is a newly identified standalone issue. A technician will be assigned shortly.'}

You can track, edit, or delete this complaint anytime under **My Complaints**.`;

      addToast({
        type: 'success',
        title: 'Issue Triaged via Chat',
        message: `Ticket ${submitted.report_id} generated at Priority P${submitted.ground_truth_priority}`
      });
    }

    try {
      // Send input to Gemini through the server API endpoint.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          triageContext
        }),
      });

      const data = await response.json();
      const replyContent = data.reply || triageContext || "Unable to generate a Gemini response right now.";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: Date.now(),
        model: data.model || selectedModel
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      // Fallback in case of network issue
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: triageContext || "Your message was processed locally while Gemini was unavailable. Ticket data remains in the local store.",
        timestamp: Date.now(),
        model: selectedModel
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">CampusMI AI Copilot</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-blue-950 text-blue-300 border border-blue-800">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Automated triage & natural language processing</p>
            </div>
          </div>
        </div>

        {/* Model Badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <div className={`w-2 h-2 rounded-full ${geminiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-zinc-500 font-medium">Model:</span>
            <span className="font-mono font-bold text-zinc-200">gemini/flash-lite</span>
            <span className="hidden sm:inline text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
              {geminiConnected ? 'LIVE' : 'SETUP'}
            </span>
          </div>

          <button
            type="button"
            onClick={clearChat}
            title="Clear Chat History"
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 border border-zinc-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 max-w-2xl text-xs sm:text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>
                <div
                  className={`mt-1.5 text-[10px] flex items-center gap-2 ${
                    isUser ? 'text-blue-200 justify-end' : 'text-zinc-500 justify-between'
                  }`}
                >
                  {!isUser && (
                    <span className="font-mono text-[9px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                      gemini/flash-lite
                    </span>
                  )}
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Querying Gemini & processing input...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-zinc-800/80 bg-zinc-950 p-4 shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a maintenance report (e.g. 'Water pipe burst in Hostel C 3rd floor') or ask a question..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
