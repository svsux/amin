import { FiHome, FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";

interface HeaderProps {
  userEmail: string | null;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="bg-[#121418] border-b border-[#1E2228] sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <FiHome className="text-[#0066FF] h-8 w-8" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Панель администратора</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#A0A8B8] hidden sm:block">Привет, {userEmail}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-[#0066FF] hover:text-blue-400 font-semibold transition-colors flex items-center gap-1"
            >
              <FiLogOut /> На главную
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}