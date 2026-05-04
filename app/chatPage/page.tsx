"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Send,
  Image as ImageIcon,
  Copy,
  Check,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Menu,
  X,
  MessageSquareOff,
  FileText, // Tambahan Icon
  Upload, // Tambahan Icon
  FileUp, // Tambahan Icon
} from "lucide-react";

// --- Types ---
interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

// --- TAMBAHAN TYPE FILE ---
interface FileMetadata {
  id: string;
  name: string;
  size: string;
  type: string;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // --- TAMBAHAN STATE UNTUK FILE ---
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFiles, setTempFiles] = useState<FileMetadata[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const isMobile = window.innerWidth < 640;
      const maxHeight = isMobile ? 80 : 120;
      const nextHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [inputText]);

  // Handle Responsive History
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowHistory(true);
      else setShowHistory(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- LOAD DATA FROM LOCAL STORAGE ---
  useEffect(() => {
    const savedSessions = localStorage.getItem("layanan_ai_sessions");
    const savedFiles = localStorage.getItem("layanan_ai_files");

    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    }

    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, []);

  // --- SAVE DATA TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("layanan_ai_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("layanan_ai_files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, sessions]);

  const activeSession = sessions.find((s) => s.id === activeId);

  // --- LOGIC FILE MANAGEMENT ---
  const handleOpenModal = () => {
    setTempFiles([...files]); // Salin file yang ada ke temporary
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Filter type & limit
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" || file.type === "text/plain",
    );

    if (tempFiles.length + validFiles.length > 5) {
      alert("Maksimal 5 file saja yang diperbolehkan.");
      return;
    }

    const newFiles: FileMetadata[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type,
    }));

    setTempFiles([...tempFiles, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeTempFile = (id: string) => {
    setTempFiles(tempFiles.filter((f) => f.id !== id));
  };

  const saveFileChanges = () => {
    setFiles(tempFiles);
    setIsModalOpen(false);
  };

  // --- CHAT LOGIC ---
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setActiveId(newSession.id);
    if (window.innerWidth < 1024) setShowSidebar(false);
  };

  const deleteSession = () => {
    const filtered = sessions.filter((s) => s.id !== activeId);
    setSessions(filtered);
    setActiveId(filtered.length > 0 ? filtered[0].id : "");
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    let currentSessions = [...sessions];
    let sessionIndex = currentSessions.findIndex((s) => s.id === activeId);

    if (sessionIndex === -1) {
      const newSess: ChatSession = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
      };
      currentSessions = [newSess, ...currentSessions];
      sessionIndex = 0;
      setActiveId(newSess.id);
    }

    const userMsg: Message = { role: "user", content: inputText };
    const updatedMessages = [...currentSessions[sessionIndex].messages, userMsg];

    if (currentSessions[sessionIndex].messages.length === 0) {
      currentSessions[sessionIndex].title = inputText.split(" ").slice(0, 5).join(" ") + "...";
    }

    // Logic simulasi AI dengan konteks file
    let aiContent =
      files.length > 0
        ? `Saya telah menganalisis ${files.length} file Anda. Berdasarkan data tersebut, apa yang spesifik ingin Anda tanyakan?`
        : "Maaf, silakan lampirkan file terlebih dahulu agar saya dapat memberikan analisis yang akurat.";

    const aiMsg: Message = { role: "ai", content: aiContent };
    currentSessions[sessionIndex].messages = [...updatedMessages, aiMsg];

    setSessions(currentSessions);
    setInputText("");
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      {/* Overlay for Mobile */}
      {(showSidebar ||
        (showHistory && typeof window !== "undefined" && window.innerWidth < 1024)) && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-30 lg:hidden transition-all duration-500"
          onClick={() => {
            setShowSidebar(false);
            setShowHistory(false);
          }}
        />
      )}

      {/* --- Sidebar Kiri (Navigation) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-auto min-w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 px-4 gap-6 transition-transform duration-300 lg:translate-x-0 lg:static lg:w-20 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="lg:hidden w-full flex justify-end mb-4">
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <button
          onClick={createNewSession}
          className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all text-white shadow-lg shadow-indigo-600/20 w-full lg:w-auto"
        >
          <Plus size={24} />
          <span className="font-bold text-sm lg:hidden">Tambah Pesan</span>
        </button>

        <button
          onClick={deleteSession}
          disabled={!activeId}
          className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 transition-all text-slate-400 border border-slate-700 w-full lg:w-auto disabled:opacity-50"
        >
          <Trash2 size={20} />
          <span className="font-bold text-sm lg:hidden">Hapus Pesan</span>
        </button>
      </aside>

      {/* --- Main Chat Area --- */}
      <section className="flex-1 flex flex-col relative min-w-0 bg-slate-950 overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-8 h-16 bg-slate-950/40 backdrop-blur-md border-b border-slate-800 z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400 shrink-0" size={18} />
              <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white truncate">
                LayananAI
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono hidden md:block border border-slate-800 px-2 py-1 rounded">
              v1.0.4
            </span>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <PanelRightOpen size={20} />
            </button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pt-6 pb-40 px-4 sm:px-8 lg:px-12 scroll-smooth custom-scrollbar"
        >
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 px-6">
                <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
                  <MessageSquare className="text-indigo-400" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-300">
                  Apa yang ingin anda tanyakan?
                </h2>
                {files.length > 0 && (
                  <p className="text-slate-500 text-sm">{files.length} file siap dianalisis</p>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {activeSession.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group relative max-w-[90%] sm:max-w-[80%] p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none backdrop-blur-sm"}`}
                  >
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold hover:text-indigo-400"
                        >
                          {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                          {copiedIndex === idx ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-1.5 shadow-2xl focus-within:border-indigo-500/50 transition-all">
              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())
                }
                placeholder={
                  files.length > 0 ? "Tanyakan sesuatu tentang file Anda..." : "Ketik pesan..."
                }
                className="w-full bg-transparent border-none text-white p-3 sm:p-4 focus:outline-none resize-none placeholder:text-slate-600 text-sm sm:text-base custom-scrollbar-input overflow-y-auto min-h-[44px] sm:min-h-[56px]"
                ref={textareaRef}
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex gap-1">
                  <button className="p-2 text-slate-500 hover:text-indigo-400 transition-all">
                    <ImageIcon size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm font-bold"
                >
                  <span className="hidden sm:inline">Kirim</span>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Sidebar Kanan (History & File Management) --- */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-300 lg:static lg:translate-x-0 ${showHistory ? "translate-x-0 w-72 sm:w-80" : "translate-x-full w-0 border-none"}`}
      >
        <div
          className={`flex flex-col h-full min-w-[18rem] sm:min-w-[20rem] ${!showHistory && "hidden lg:flex"}`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <span className="font-bold text-slate-300">Riwayat Chat</span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <PanelRightClose size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar ">
            {sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => {
                  setActiveId(sess.id);
                  if (window.innerWidth < 1024) setShowHistory(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm transition-all border ${activeId === sess.id ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300 shadow-inner" : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800"}`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={14} className="shrink-0 opacity-50" />
                  <span className="truncate">{sess.title}</span>
                </div>
              </button>
            ))}
            {sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50">
                  <MessageSquareOff size={20} className="text-slate-600" />
                </div>
                <h1 className="text-slate-500 text-sm font-medium">Belum ada percakapan</h1>
              </div>
            )}
          </div>

          {/* --- MODAL TRIGGER SECTION --- */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div
              className={`p-5 rounded-2xl space-y-4 border transition-all duration-300 ${files.length > 0 ? "bg-indigo-600/5 border-indigo-500/20" : "bg-slate-500/5 border-slate-500/10"}`}
            >
              <p className="text-sm text-white leading-relaxed font-semibold text-center">
                {files.length > 0
                  ? `${files.length} File Aktif`
                  : "File anda akan di analisis oleh AI kami"}
              </p>
              <button
                onClick={handleOpenModal}
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl text-xs font-bold transition-all shadow-lg ${files.length > 0 ? "bg-indigo-600 hover:bg-indigo-500" : "bg-slate-700 hover:bg-slate-600"} text-white`}
              >
                {files.length > 0 ? <FileText size={16} /> : <Plus size={16} />}
                {files.length > 0 ? "Lihat File" : "Tambahkan File"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- UI MODAL INTERAKTIF (FILE MANAGEMENT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileUp className="text-indigo-400" size={20} />
                Manajemen File
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {tempFiles.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <Upload size={24} />
                  </div>
                  <p className="text-slate-300 font-medium">Masukkan File yang perlu dianalisis</p>
                  <p className="text-slate-500 text-xs">Mendukung PDF dan TXT (Maks. 5)</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {tempFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700 group"
                    >
                      <button
                        onClick={() => removeTempFile(file.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">
                          {file.size} • {file.type.split("/")[1]}
                        </p>
                      </div>
                      <FileText size={18} className="text-indigo-400 opacity-40" />
                    </div>
                  ))}
                </div>
              )}

              {tempFiles.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl p-4 transition-all cursor-pointer group text-center"
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Plus size={20} className="text-slate-500 group-hover:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-300">
                      {tempFiles.length === 0 ? "Pilih File" : "Tambah File Lagi"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-800">
              <button
                onClick={saveFileChanges}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                {files.length === 0 ? "Submit" : "Ubah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle History Button for Large Screens */}
      {!showHistory && (
        <button
          onClick={() => setShowHistory(true)}
          className="fixed right-4 top-20 z-20 p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl backdrop-blur-md hidden lg:block"
        >
          <PanelRightOpen size={20} />
        </button>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }

        .custom-scrollbar-input::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-input::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 10px;
        }
        .custom-scrollbar-input::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 10px;
        }

        textarea {
          scrollbar-width: none;
        }
        .custom-scrollbar-input {
          scrollbar-width: thin;
          scrollbar-color: #4f46e5 #0f172a;
        }
      `}</style>
    </div>
  );
}
