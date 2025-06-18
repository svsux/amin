// filepath: c:\Users\murza\Desktop\Stash\amin\src\app\cashier\page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import StoreHeader from "./components/StoreHeader";
import ShiftControl from "./components/ShiftControl";
import CashRegister from "./components/CashRegister";
import TransactionLogs from "./components/TransactionLogs";
import ConfirmCloseModal from "./components/ConfirmCloseModal";
import ShiftReportModal, { ReportData } from "./components/ShiftReportModal";
import Notification from "./components/Notification";
import { FiGrid, FiLogOut } from "react-icons/fi";

export default function CashierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const triggerRefetch = () => setDataVersion(v => v + 1);

  useEffect(() => {
    const checkShiftStatus = async () => {
      try {
        const response = await fetch("/api/cashier/shift/status");
        const data = await response.json();
        setIsShiftOpen(data.isShiftOpen);
      } catch (error) {
        console.error("Failed to fetch shift status", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (status === "authenticated") {
      checkShiftStatus();
    }
  }, [status]);

  const handleSignOut = () => {
    if (isShiftOpen) {
      setShowConfirmModal(true);
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  const handleCloseShift = async () => {
    const response = await fetch("/api/cashier/shift/close", { method: "POST" });
    if (!response.ok) {
      const errorData = await response.json();
      alert(`Ошибка: ${errorData.message}`);
      return null;
    }
    const data = await response.json();
    setReportData(data.report);
    setIsShiftOpen(false);
    setShowReportModal(true);
    triggerRefetch();
    return data.report;
  };

  const handleConfirmAndLogout = async () => {
    setShowConfirmModal(false);
    setIsLoggingOut(true);
    await handleCloseShift();
  };

  const handleReportModalClose = () => {
    setShowReportModal(false);
    setReportData(null);
    if (isLoggingOut) {
      signOut({ callbackUrl: "/" });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0F1115]">
        <span className="text-lg text-gray-300">Загрузка...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F1115]">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-indigo-900/40 p-2 shadow">
              <FiGrid className="text-indigo-400 text-2xl" />
            </span>
            <span className="tracking-tight">Панель кассира</span>
          </h1>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
          >
            <FiLogOut />
            Выйти
          </button>
        </header>

        {/* Grid: Store info + Shift control */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          <div className="lg:col-span-4">
            <div className="bg-[#181B20] rounded-xl shadow p-4 h-full flex flex-col justify-center border border-[#23262B]">
              <StoreHeader />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-[#181B20] rounded-xl shadow p-4 h-full flex flex-col justify-center border border-[#23262B]">
              <ShiftControl
                isShiftOpen={isShiftOpen}
                onOpenShift={() => {
                  setIsShiftOpen(true);
                  triggerRefetch();
                }}
                onCloseShift={handleCloseShift}
              />
            </div>
          </div>
        </div>

        {/* Main content: Cash register + Transaction logs */}
        <main className="flex flex-col">
          <div>
            <div className="bg-[#181B20] rounded-xl shadow p-6 mb-8 border border-[#23262B]">
              <CashRegister
                isShiftOpen={isShiftOpen}
                dataVersion={dataVersion}
                onPaymentSuccess={triggerRefetch}
                setNotification={setNotification}
              />
            </div>
          </div>
          <div>
            <div className="bg-[#181B20] rounded-xl shadow p-6 border border-[#23262B]">
              <TransactionLogs
                isShiftOpen={isShiftOpen}
                dataVersion={dataVersion}
              />
            </div>
          </div>
        </main>

        {/* Модальные окна */}
        <ConfirmCloseModal
          isOpen={showConfirmModal}
          onConfirm={handleConfirmAndLogout}
          onCancel={() => setShowConfirmModal(false)}
        />
        <ShiftReportModal
          isOpen={showReportModal}
          reportData={reportData}
          onClose={handleReportModalClose}
        />
      </div>
    </div>
  );
}