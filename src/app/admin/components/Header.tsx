import { FiHome, FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";

interface HeaderProps {
  userEmail: string | null;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <FiHome className="text-indigo-600 h-8 w-8" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Панель администратора</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">Привет, {userEmail}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-1"
            >
              <FiLogOut /> На главную
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}