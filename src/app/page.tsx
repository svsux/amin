"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "ADMIN") {
        router.replace("/admin");
      } else if (session?.user?.role === "CASHIER") {
        router.replace("/cashier");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white text-xl">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1F2937] via-[#3B82F6] to-[#10B981]">
      <motion.div
        className="relative bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-md w-full text-center border border-white/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl font-bold text-white mb-6 drop-shadow"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          SmartPoint
        </motion.h1>

        <motion.p
          className="text-white/80 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Добро пожаловать в платформу. Пожалуйста, авторизуйтесь, чтобы
          продолжить.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {session ? (
            <>
              <p className="text-white font-medium mb-4">
                {session.user?.email} <br />
                <span className="text-white/60 text-sm">
                  Роль: {session.user?.role}
                </span>
              </p>
              <button
                onClick={() => signOut()}
                className="w-full py-3 bg-red-500 hover:bg-red-600 transition rounded-xl text-white font-semibold shadow-lg"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold shadow-lg"
            >
              Войти
            </Link>
          )}
        </motion.div>

        <motion.footer
          className="mt-10 text-sm text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          © 2025 SmartPoint. Все права защищены.
        </motion.footer>
      </motion.div>
    </div>
  );
}
