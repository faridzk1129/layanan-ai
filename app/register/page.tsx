"use client";

import {
  LockKeyhole,
  User,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import BackgroundOrnament from "@/components/BackgroundOrnament";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) return;

      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    };
    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success" | null; msg: string }>({
    type: null,
    msg: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status.type) setStatus({ type: null, msg: "" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, msg: "" });

    // Simulasi delay API
    setTimeout(() => {
      // 1. Validasi Field Kosong
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.password_confirmation
      ) {
        setStatus({ type: "error", msg: "Semua field wajib diisi." });
        setIsLoading(false);
        return; // BERHENTI DI SINI
      }

      // 2. Validasi Format Email
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(formData.email)) {
        setStatus({ type: "error", msg: "Format email tidak valid." });
        setIsLoading(false);
        return; // BERHENTI DI SINI
      }

      // 3. Validasi Panjang Password
      if (formData.password.length < 8) {
        setStatus({ type: "error", msg: "Password minimal harus 8 karakter." });
        setIsLoading(false);
        return; // BERHENTI DI SINI
      }

      // 4. Validasi Kesamaan Password (Penyebab error Anda sebelumnya)
      if (formData.password !== formData.password_confirmation) {
        setStatus({ type: "error", msg: "Konfirmasi password tidak cocok!" });
        setIsLoading(false);
        return; // BERHENTI DI SINI
      }

      // 5. Jika lolos semua validasi di atas
      setStatus({ type: "success", msg: "Registrasi berhasil! Mengalihkan..." });

      // Redirect hanya jika benar-benar sukses
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 1000);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-x-hidden overflow-y-auto sm:overflow-hidden">
      <BackgroundOrnament />

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl relative z-10 p-8 lg:p-10 transition-all duration-500 my-auto lg:my-0">
        <div className="text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-4 border border-indigo-500/20">
            <User size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Buat Akun Baru</h2>
          <p className="text-slate-400 text-sm mt-2">Daftar untuk mulai menganalisis dokumen AI</p>
        </div>

        {status.type && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border animate-in fade-in zoom-in duration-300 ${
              status.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {status.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {status.msg}
          </div>
        )}

        <form className="space-y-3 lg:space-y-4" onSubmit={handleRegister}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 ml-1 relative bottom-1  tracking-wider">
              Nama Lengkap
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <User size={18} />
              </div>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Anda"
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 ml-1 relative bottom-1  tracking-wider">
              Email
            </label>
            <div className="relative group ">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="email@contoh.com"
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 relative bottom-1  tracking-wider">
                Password
              </label>
              <div className="relative group ">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <LockKeyhole size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 relative bottom-1  tracking-wider">
                Konfirmasi
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <LockKeyhole size={18} />
                </div>
                <input
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 mt-4 lg:mt-6"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Daftar Sekarang <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 lg:mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Sudah punya akun?{" "}
            <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
