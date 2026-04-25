"use client";
import { LockKeyhole, User, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import BackgroundOrnament from "@/components/BackgroundOrnament";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // --- States ---
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Constants (Default Credential) ---
  const DEFAULT_USER = "farid";
  const DEFAULT_PASS = "haha1129";

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Reset error saat user mengetik
  };

  // --- Login Logic ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulasi delay network (nanti akan diganti dengan call ke Supabase)
    setTimeout(() => {
      if (formData.username === DEFAULT_USER && formData.password === DEFAULT_PASS) {
        // Berhasil Login
        router.push("/chatPage");
      } else {
        // Gagal Login
        setError("Username atau password salah.");
        setIsLoading(false);
      }
    }, 1200);
  };

  useEffect(() => {
    const handleFocus = (e: any) => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) return;
      const target = e.target;
      if (target.tagName === "INPUT") {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    };
    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, []);
  return (
    <main
      ref={containerRef}
      className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-8  relative overflow-hidden"
    >
      <BackgroundOrnament />
      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 scale-95">
        {/* Bagian Kiri: Brand & Info */}
        <div className="relative p-8 lg:p-16 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600/10 to-transparent">
          <div className="relative z-10 flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl font-bold text-white tracking-tight">LayananAI</span>
            </div>

            <h1 className="text-xl lg:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-6 text-center sm:text-left">
              Transformasi{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Administrasi
              </span>{" "}
              dengan AI
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed hidden sm:block">
              Platform AI untuk membantu proses administrasi lebih cepat, dan transparan bagi semua
              pengguna.
            </p>
          </div>

          {/* Aksesoris Visual (Membuat Terlihat Ramai & Aesthetic) */}
          <div className="mt-12 relative hidden sm:block">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full animate-pulse" />
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm relative z-10">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="space-y-3">
                <div className="h-2 w-[80%] bg-slate-700 rounded-full animate-pulse" />
                <div className="h-2 w-[60%] bg-slate-700 rounded-full animate-pulse delay-75" />
                <div className="h-2 w-[90%] bg-slate-700 rounded-full animate-pulse delay-150" />
              </div>
              <div className="mt-6 flex items-center gap-2 text-indigo-400 text-sm font-medium">
                <Sparkles size={16} />
                <span>Asisten AI sedang menganalisis perintah anda...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Login Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-slate-800">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-6 sm:mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-white mb-2 hidden sm:block">Selamat Datang</h2>
              <p className="text-slate-400">Masuk ke akun anda untuk memulai</p>
            </div>
            {/* Alert Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                <div className="relative group mt-2">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <LockKeyhole size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 group mt-4"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Login
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-500 text-sm">
                Belum punya akun?{" "}
                <a href="#" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  Hubungi Admin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimalis */}
      <p className="absolute bottom-2 sm:bottom-6 text-slate-600 text-xs">
        &copy; 2026 LayananAI. Built with high-efficiency intelligence.
      </p>
    </main>
  );
}
