import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Login validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoginLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      await login({ email: data.email, password: data.password });
      // Navigate to dashboard - AuthContext now handles the auth state centrally
      console.log("[LoginPage] Login successful, navigating to dashboard");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      setError("root", {
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Gagal masuk. Periksa kembali email dan password anda.",
      });
    }
  };

  // Auth checking is now handled by PublicRoute in App.tsx
  // No need for auth logic here

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          Selamat Datang Kembali
        </h1>
        <p className="mt-2 text-gray-500">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={18} />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              className="h-12 pl-11 pr-4 bg-gray-50/80 border-gray-200 rounded-xl text-sm transition-all focus:bg-white focus:border-[#0053C5] focus:ring-4 focus:ring-[#0053C5]/10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              className="h-12 pl-11 pr-12 bg-gray-50/80 border-gray-200 rounded-xl text-sm transition-all focus:bg-white focus:border-[#0053C5] focus:ring-4 focus:ring-[#0053C5]/10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {errors.root && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-500 text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-medium">Gagal masuk</p>
              <p className="text-red-500 mt-0.5">{errors.root.message}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-[#0053C5] hover:bg-[#0047AB] text-white font-semibold rounded-xl shadow-lg shadow-[#0053C5]/25 hover:shadow-xl hover:shadow-[#0053C5]/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          disabled={isLoginLoading}
        >
          {isLoginLoading ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Sedang masuk...
            </>
          ) : (
            <>
              Masuk
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Footer Links */}
      <div className="text-center text-sm text-gray-500">
        <div className="text-gray-500">
          Belum punya akun? Hubungi Administrator ke email{" "}
          <a
            href="mailto:donarazhar@al-azhar.or.id"
            className="font-medium text-[#0053C5] hover:text-[#0047AB] transition-colors"
          >
            donarazhar@al-azhar.or.id
          </a>{" "}
          atau whatsapp{" "}
          <a
            href="https://wa.me/6288214740182"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0053C5] hover:text-[#0047AB] transition-colors"
          >
            0882-1474-0182
          </a>
        </div>
      </div>
    </div>
  );
}
