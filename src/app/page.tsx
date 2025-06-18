"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Проверяем, что пользователь находится на главной странице
    if (status === "authenticated" && window.location.pathname === "/") {
      if (session?.user?.role === "ADMIN") {
        router.replace("/admin");
      } else if (session?.user?.role === "CASHIER") {
        router.replace("/cashier");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1115] text-white text-xl">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] px-4">
      <motion.div
        className="relative bg-[#181B20]/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-md w-full text-center border border-[#23262B]"
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
            width={150}
            height={150}
            priority
            className="drop-shadow-md"
          />
        </motion.div>

        <motion.p
          className="text-white/80 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Добро пожаловать! Пожалуйста, авторизуйтесь, чтобы продолжить.
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
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-white font-semibold shadow-lg"
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
          © {new Date().getFullYear()} SmartPoint. Все права защищены.
        </motion.footer>
      </motion.div>
    </div>
  );
}
