"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiAlertCircle } from "react-icons/fi";

import Header from "./components/Header";
import Footer from "./components/Footer";
import TabNavigation from "./components/TabNavigation";

// Динамический импорт секций для лучшей производительности
import dynamic from 'next/dynamic';
const LoadingComponent = () => <div className="text-center py-10">Загрузка секции...</div>;
const CashiersSection = dynamic(() => import('./sections/CashiersSection'), { ssr: false, loading: LoadingComponent });
const ProductsSection = dynamic(() => import('./sections/ProductsSection'), { ssr: false, loading: LoadingComponent });
const StoresSection = dynamic(() => import('./sections/StoresSection'), { ssr: false, loading: LoadingComponent });
const ReportsSection = dynamic(() => import('./components/ReportsSection'), { ssr: false, loading: LoadingComponent });

type Tab = "cashiers" | "products" | "stores" | "reports";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cashiers");

  // --- Аутентификация и авторизация ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0F1115] text-white">
        Загрузка сессии...
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Возвращаем null, так как useEffect уже делает редирект
    return null;
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-8 bg-[#0F1115]">
        <FiAlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold text-white">Доступ запрещен</h1>
        <p className="text-gray-400 mt-2">У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  // --- Рендеринг страницы ---
  return (
    <div className="min-h-screen bg-[#0F1115] text-white">
      <Header userEmail={session?.user?.email || null} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation currentTab={tab} onTabChange={setTab} />
        <div className="mt-8">
          {tab === "cashiers" && <CashiersSection />}
          {tab === "products" && <ProductsSection />}
          {tab === "stores" && <StoresSection />}
          {tab === "reports" && <ReportsSection />}
        </div>
      </main>
      <Footer />
    </div>
  );
}