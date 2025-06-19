// filepath: c:\Users\murza\Desktop\Stash\amin\src\app\cashier\page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";

import StoreHeader from "./components/StoreHeader";
import LoadingSpinner from "./components/LoadingSpinner";
import Notification from "./components/Notification";
import ShiftReportModal, { ReportData } from "./components/ShiftReportModal";
import ConfirmCloseModal from "./components/ConfirmCloseModal";
import ShiftControl from "./components/ShiftControl";
import CashRegister from "./components/CashRegister";
import TransactionLogs from "./components/TransactionLogs";

interface Store {
  id: string;
  name: string;
  address: string;
}

interface ShiftData {
  id: string;
  store: Store;
  cashier: { name: string | null; email: string | null };
}

export default function CashierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<ShiftData | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  
  const triggerRefetch = () => setDataVersion((v) => v + 1);

  useEffect(() => {
    if (status === "authenticated") {
      const loadInitialData = async () => {
        setIsLoading(true);
        try {
          const shiftRes = await fetch("/api/cashier/shift/current");
          const shiftData = await shiftRes.json();
          if (shiftData.shift) {
            setIsShiftOpen(true);
            setActiveShift(shiftData.shift);
          } else {
            setIsShiftOpen(false);
            setActiveShift(null);
            const storesRes = await fetch("/api/cashier/store");
            const storesData = await storesRes.json();
            setStores(storesData.stores || []);
            if (storesData.stores && storesData.stores.length > 0) {
              setSelectedStoreId(storesData.stores[0].id);
            }
          }
        } catch (error) {
          setNotification({ message: "Ошибка загрузки данных", type: "error" });
        } finally {
          setIsLoading(false);
        }
      };
      loadInitialData();
    }
  }, [status, dataVersion]);

  const handleOpenShift = async () => {
    if (!selectedStoreId) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/cashier/shift/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: selectedStoreId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Не удалось открыть смену");
      setNotification({ message: "Смена успешно открыта", type: "success" });
      triggerRefetch();
    } catch (error) {
      setNotification({ message: (error as Error).message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseShift = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cashier/shift/close", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Не удалось закрыть смену");
      setReportData(data.report);
    } catch (error) {
      setNotification({ message: (error as Error).message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutClick = () => {
    if (isShiftOpen) {
      setIsSigningOut(true);
      setShowConfirmModal(true);
    } else {
      signOut({ callbackUrl: "/login" });
    }
  };

  const confirmCloseAndSignOut = async () => {
    setShowConfirmModal(false);
    await handleCloseShift();
  };

  const handleReportAcknowledged = () => {
    setReportData(null);
    if (isSigningOut) {
      signOut({ callbackUrl: "/login" });
    } else {
      triggerRefetch();
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) return <LoadingSpinner />;
  if (status === "unauthenticated") {
    router.push("/login");
    return <LoadingSpinner />;
  }

  if (!isShiftOpen) {
    return (
      <div className="min-h-screen bg-[#0D0F12] flex flex-col items-center justify-center p-4">
        {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
        <div className="w-full max-w-md text-center bg-[#181B20] p-8 rounded-xl border border-[#23262B] shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Смена закрыта</h1>
          <p className="text-gray-400 mb-8">Выберите магазин, чтобы начать новую смену.</p>
          <div className="space-y-4 flex flex-col items-center">
            <select value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)} className="w-full p-3 bg-[#23262B] border border-[#2D3138] rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" disabled={stores.length === 0}>
              {stores.length === 0 ? <option>Нет доступных магазинов</option> : stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
            <ShiftControl label="Открыть смену" isLoading={isLoading} onClick={handleOpenShift} isDisabled={!selectedStoreId} />
            <button onClick={handleSignOutClick} className="w-full max-w-[260px] bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <FiLogOut />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0F12] text-white p-4">
      {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
      <ShiftReportModal isOpen={!!reportData} reportData={reportData} onClose={handleReportAcknowledged} />
      <ConfirmCloseModal isOpen={showConfirmModal} onCancel={() => { setShowConfirmModal(false); setIsSigningOut(false); }} onConfirm={confirmCloseAndSignOut} />

      <main className="max-w-screen-2xl mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#181B20] rounded-xl p-4 border border-[#23262B] flex items-center shadow-lg">
            <StoreHeader store={activeShift?.store} cashier={activeShift?.cashier} />
          </div>
          <div className="bg-[#181B20] rounded-xl p-4 border border-[#23262B] flex items-center justify-center gap-4 shadow-lg">
            <ShiftControl label="Закрыть смену" isLoading={isLoading} onClick={handleCloseShift} />
            <button onClick={handleSignOutClick} className="py-2 px-5 rounded-md bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2">
              <FiLogOut />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <CashRegister isShiftOpen={isShiftOpen} dataVersion={dataVersion} onPaymentSuccess={triggerRefetch} setNotification={setNotification} />
          <TransactionLogs isShiftOpen={isShiftOpen} dataVersion={dataVersion} />
        </div>
      </main>
    </div>
  );
}