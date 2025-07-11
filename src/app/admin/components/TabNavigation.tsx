import clsx from "clsx";
import { FiUsers, FiPackage, FiArchive, FiBarChart2 } from "react-icons/fi";

// 1. Добавляем 'reports' в тип Tab
type Tab = "cashiers" | "products" | "stores" | "reports";

interface TabNavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

// 2. Создаем массив с данными для всех вкладок, включая "Отчеты"
const tabs = [
  { id: "cashiers", label: "Кассиры", icon: FiUsers },
  { id: "products", label: "Товары", icon: FiPackage },
  { id: "stores", label: "Магазины", icon: FiArchive },
  { id: "reports", label: "Отчеты", icon: FiBarChart2 }, // Новая вкладка
];

export default function TabNavigation({ currentTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex justify-center border-b border-[#1E2228]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={clsx(
            "py-3 px-4 sm:px-6 font-semibold flex items-center gap-2 transition-all duration-150 ease-in-out -mb-px",
            currentTab === tab.id
              ? "border-b-2 border-[#0066FF] text-[#0066FF]"
              : "text-[#A0A8B8] hover:text-white hover:border-gray-700 border-b-2 border-transparent"
          )}
          onClick={() => onTabChange(tab.id as Tab)}
        >
          <tab.icon
            className={`${
              currentTab === tab.id ? "text-[#0066FF]" : "text-gray-500 group-hover:text-gray-400"
            } -ml-0.5 mr-2 h-5 w-5`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
        </button>
      ))}
    </nav>
  );
}