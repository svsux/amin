"use client";

import { useState, FormEvent, useRef } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const abortedRef = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Сбрасываем состояние "абортирован" при новом сабмите
    abortedRef.current = false;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (abortedRef.current) return; // Если пользователь нажал "На главную", ничего не делаем

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Неверный email или пароль."
            : result.error
        );
        setIsLoading(false);
      } else if (result?.ok) {
        const session = await getSession();
        if (abortedRef.current) return;

        if (session?.user?.role === "ADMIN") {
          router.replace("/admin");
        } else if (session?.user?.role === "CASHIER") {
          const res = await fetch("/api/cashier/store", { cache: "no-store" });
          if (abortedRef.current) return;

          if (!res.ok) {
            setError("Вы не привязаны ни к одному магазину. Обратитесь к администратору.");
            setIsLoading(false);
            return;
          }

          const data = await res.json();
          const stores = Array.isArray(data.stores)
            ? data.stores
            : Array.isArray(data.store)
            ? data.store
            : [];

          if (stores.length === 0) {
            setError("Вы не привязаны ни к одному магазину. Обратитесь к администратору.");
            setIsLoading(false);
            return;
          }

          router.replace("/cashier");
        } else {
          router.replace("/");
        }
      } else {
        setError("Произошла неизвестная ошибка. Попробуйте снова.");
        setIsLoading(false);
      }
    } catch (err) {
      if (abortedRef.current) return; // Если пользователь нажал "На главную", ничего не делаем
      console.error("Login error:", err);
      setError("Произошла ошибка при попытке входа.");
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    // Устанавливаем состояние "абортирован"
    abortedRef.current = true;
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] px-4">
      <motion.div
        className="relative bg-[#181B20]/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-full max-w-md text-white border border-[#23262B]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Image
            src="/login/SmartLogo.png"
            alt="Smart Logo"
            width={120}
            height={120}
            priority
            className="drop-shadow-md"
          />
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#23262B] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-gray-300"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#23262B] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ваш пароль"
            />
          </motion.div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-white font-semibold shadow-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? "Вход..." : "Войти"}
          </motion.button>
        </form>

        <motion.button
          onClick={handleGoHome}
          className="w-full mt-4 py-3 bg-[#23262B] hover:bg-[#23262B]/80 rounded-xl font-semibold text-gray-200 transition"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          На главную
        </motion.button>

        <motion.footer
          className="mt-8 text-sm text-gray-500 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          © {new Date().getFullYear()} SmartPoint. Все права защищены.
        </motion.footer>
      </motion.div>
    </div>
  );
}
