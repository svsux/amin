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
import { FiGrid, FiLogOut } from "react-icons/fi"; // Импортируем иконки

export default function CashierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Состояние для уведомлений
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Триггер для обновления данных
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
    triggerRefetch(); // Обновляем данные после закрытия смены
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
    return <p className="flex justify-center items-center min-h-screen">Загрузка...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiGrid className="text-indigo-600" />
            <span>Панель кассира</span>
          </h1>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            <FiLogOut />
            <span>Выйти</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          <div className="lg:col-span-4">
            <StoreHeader />
          </div>
          <div className="lg:col-span-1">
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

        <main className="space-y-8">
          <CashRegister 
            isShiftOpen={isShiftOpen} 
            dataVersion={dataVersion}
            onPaymentSuccess={triggerRefetch}
            setNotification={setNotification}
          />
          <TransactionLogs 
            isShiftOpen={isShiftOpen}
            dataVersion={dataVersion}
          />
        </main>

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