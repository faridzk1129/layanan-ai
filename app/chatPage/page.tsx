"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
  Upload,
  FileUp,
  Loader2,
  AlertCircle, // {/* TAMBAHKAN */}
  CheckCircle2, // {/* TAMBAHKAN */}
} from "lucide-react";
import { fetchApi } from "@/lib/api";

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

interface FileMetadata {
  id: string;
  name: string;
  size?: string;
  type?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempFiles, setTempFiles] = useState<FileMetadata[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // {/* TAMBAHKAN: State untuk Notifikasi & Confirm */}
  const [status, setStatus] = useState<{ type: "success" | "error" | null; msg: string }>({
    type: null,
    msg: "",
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    msg: string;
    onConfirm: () => void;
  }>({ isOpen: false, msg: "", onConfirm: () => {} });

  // {/* TAMBAHKAN: Fungsi Helper untuk Trigger Notifikasi */}
  const showToast = (type: "success" | "error", msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: null, msg: "" }), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }

    const syncFiles = async () => {
      try {
        const response = await fetchApi("/api/documents");
        if (response.success) {
          const mappedFiles = response.data.documents.map((doc: any) => ({
            id: doc.id,
            name: doc.title,
          }));
          setFiles(mappedFiles);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi file:", err);
      }
    };

    syncFiles();

    const savedSessions = localStorage.getItem("layanan_ai_sessions");
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    }
  }, [router]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const isMobile = window.innerWidth < 640;
      const maxHeight = isMobile ? 80 : 120;
      const nextHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [inputText]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowHistory(true);
      else setShowHistory(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("layanan_ai_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, sessions]);

  const activeSession = sessions.find((s) => s.id === activeId);

  const handleOpenModal = () => {
    setTempFiles([...files]);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf" && selectedFile.type !== "text/plain") {
      showToast("error", "Hanya file PDF dan TXT yang didukung."); // {/* PERUBAHAN */}
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", selectedFile.name);
    formData.append("category", "General");

    try {
      const response = await fetchApi("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (response.success) {
        const newFile: FileMetadata = {
          id: response.data.document.id,
          name: response.data.document.title,
        };
        setTempFiles([...tempFiles, newFile]);
        showToast("success", "File berhasil ditambahkan!"); // {/* PERUBAHAN */}
      }
    } catch (err: any) {
      showToast("error", err.message); // {/* PERUBAHAN */}
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeTempFile = async (id: string) => {
    // {/* PERUBAHAN: Menggunakan Custom Confirm */}
    setConfirmDialog({
      isOpen: true,
      msg: "Apakah Anda yakin ingin menghapus file ini?",
      onConfirm: async () => {
        try {
          const response = await fetchApi(`/api/documents/${id}`, {
            method: "DELETE",
          });

          if (response.success) {
            setTempFiles(tempFiles.filter((f) => f.id !== id));
            showToast("success", "File berhasil dihapus!"); // {/* PERUBAHAN */}
          }
        } catch (err: any) {
          showToast("error", "Gagal menghapus file: " + err.message); // {/* PERUBAHAN */}
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const saveFileChanges = () => {
    setFiles(tempFiles);
    setIsModalOpen(false);
  };

  const formatSessionTitle = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length > 5) {
      return words.slice(0, 5).join(" ") + "...";
    }
    return text;
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "Chat Baru",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setActiveId(newSession.id);
    if (window.innerWidth < 1024) setShowSidebar(false);
  };

  const deleteSession = () => {
    // {/* PERUBAHAN: Menggunakan Custom Confirm */}
    setConfirmDialog({
      isOpen: true,
      msg: "Hapus seluruh riwayat chat ini?",
      onConfirm: () => {
        const filtered = sessions.filter((s) => s.id !== activeId);
        setSessions(filtered);
        setActiveId(filtered.length > 0 ? filtered[0].id : "");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast("success", "Chat telah dihapus.");
      },
    });
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const currentInput = inputText;
    setInputText("");
    setIsSending(true);

    let currentSessions = [...sessions];
    let sessionIndex = currentSessions.findIndex((s) => s.id === activeId);

    if (sessionIndex === -1) {
      const newSess: ChatSession = {
        id: Date.now().toString(),
        title: formatSessionTitle(currentInput),
        messages: [],
        createdAt: Date.now(),
      };
      currentSessions = [newSess, ...currentSessions];
      sessionIndex = 0;
      setActiveId(newSess.id);
    } else if (currentSessions[sessionIndex].messages.length === 0) {
      currentSessions[sessionIndex].title = formatSessionTitle(currentInput);
    }

    const userMsg: Message = { role: "user", content: currentInput };
    currentSessions[sessionIndex].messages.push(userMsg);
    setSessions([...currentSessions]);

    try {
      const response = await fetchApi("/api/chat", {
        method: "POST",
        body: JSON.stringify({ question: currentInput }),
      });

      if (response.success) {
        const aiMsg: Message = { role: "ai", content: response.data.answer };
        currentSessions[sessionIndex].messages.push(aiMsg);
        setSessions([...currentSessions]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        role: "ai",
        content: "Maaf, terjadi kesalahan: " + err.message,
      };
      currentSessions[sessionIndex].messages.push(errorMsg);
      setSessions([...currentSessions]);
      showToast("error", "Gagal mendapatkan respon AI."); // {/* TAMBAHKAN */}
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      {/* {/* TAMBAHKAN: UI NOTIFIKASI INTERAKTIF */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none">
        {status.type && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm border animate-in slide-in-from-top-4 duration-300 shadow-2xl pointer-events-auto ${
              status.type === "error"
                ? "bg-red-500/50 border-red-500/50 text-red-100"
                : "bg-emerald-500/50 border-emerald-500/50 text-emerald-100"
            }`}
          >
            {status.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="flex-1">{status.msg}</span>
            <button onClick={() => setStatus({ type: null, msg: "" })}>
              <X size={14} className="opacity-50 hover:opacity-100" />
            </button>
          </div>
        )}
      </div>

      {/* {/* TAMBAHKAN: UI CUSTOM CONFIRM DIALOG */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-950/60">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi</h3>
            <p className="text-slate-400 text-sm mb-6">{confirmDialog.msg}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar & Background Overlay */}
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

      {/* Navigasi Kiri */}
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

      {/* Konten Utama Chat */}
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
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <PanelRightOpen size={20} />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pt-6 pb-40 px-4 sm:px-8 lg:px-12 scroll-smooth custom-scrollbar"
        >
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center px-6">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
                  <MessageSquare className="text-indigo-400" size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-300">
                  Ada yang bisa dibantu hari ini?
                </h2>
                <p className="text-slate-500 text-sm max-w-sm">
                  Tanyakan apa saja terkait dokumen yang Anda unggah.
                </p>
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
                    className={`group relative max-w-[90%] sm:max-w-[80%] p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none"}`}
                  >
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    {msg.role === "ai" && (
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="mt-3 opacity-60 hover:opacity-100 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"
                      >
                        {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}{" "}
                        {copiedIndex === idx ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-slate-800/80 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                    <span className="text-sm text-slate-400">AI sedang memikirkan jawaban...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 w-full p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-1.5 shadow-2xl focus-within:border-indigo-500/50 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())
                }
                placeholder={
                  files.length > 0 ? "Tanyakan dokumen..." : "Unggah file dulu untuk bertanya..."
                }
                className="w-full bg-transparent border-none text-white p-3 sm:p-4 focus:outline-none resize-none placeholder:text-slate-600 text-sm sm:text-base custom-scrollbar-input"
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <button className="p-2 text-slate-500 hover:text-indigo-400 transition-all">
                  <ImageIcon size={18} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || files.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm font-bold"
                >
                  {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>Kirim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar Riwayat & File */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 bg-slate-900 border-l border-slate-800 flex flex-col transition-all duration-300 lg:static lg:translate-x-0 ${showHistory ? "translate-x-0 w-72 sm:w-80" : "translate-x-full w-0 border-none"}`}
      >
        <div
          className={`flex flex-col h-full min-w-[18rem] sm:min-w-[20rem] ${!showHistory && "hidden lg:flex"}`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <span className="font-bold text-slate-300">Riwayat Chat</span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-slate-500 hover:text-white lg:hidden"
            >
              <PanelRightClose size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => setActiveId(sess.id)}
                className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm transition-all border ${activeId === sess.id ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300" : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800"}`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={14} className="shrink-0 opacity-50" />
                  <span className="truncate">{sess.title}</span>
                </div>
              </button>
            ))}
            {sessions.length === 0 && (
              <p className="text-center text-slate-600 text-xs py-10">Belum ada riwayat.</p>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div
              className={`p-5 rounded-2xl space-y-4 border ${files.length > 0 ? "bg-indigo-600/5 border-indigo-500/20" : "bg-slate-500/5 border-slate-500/10"}`}
            >
              <p className="text-sm text-white font-semibold text-center">
                {files.length > 0 ? `${files.length} File Aktif` : "Belum ada file terunggah"}
              </p>
              <button
                onClick={handleOpenModal}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-xs font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
              >
                <FileText size={16} />
                Manajemen File
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MODAL FILE MANAGEMENT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-950/80">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileUp className="text-indigo-400" size={20} /> Manajemen File
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {tempFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700"
                  >
                    <button
                      onClick={() => removeTempFile(file.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                    </div>
                    <FileText size={18} className="text-indigo-400 opacity-40" />
                  </div>
                ))}
              </div>

              {/* Batasan 1 File: PERUBAHAN */}
              {tempFiles.length < 1 && (
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center transition-all cursor-pointer hover:border-indigo-500/50 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-indigo-400" />
                      <span className="text-xs text-slate-400">Sedang memproses dokumen...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Plus size={24} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Pilih PDF/TXT
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-800">
              <button
                onClick={saveFileChanges}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar-input::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-input::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
