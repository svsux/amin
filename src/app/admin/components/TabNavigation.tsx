import clsx from "clsx";
import { FiUsers, FiPackage, FiArchive } from "react-icons/fi";

interface TabNavigationProps {
  currentTab: "cashiers" | "products" | "stores";
  onTabChange: (tab: "cashiers" | "products" | "stores") => void;
}

export default function TabNavigation({ currentTab, onTabChange }: TabNavigationProps) {
  const tabItems = [
    { key: "cashiers", label: "Кассиры", icon: <FiUsers /> },
    { key: "products", label: "Товары", icon: <FiPackage /> },
    { key: "stores", label: "Магазины", icon: <FiArchive /> },
  ];

  return (
    <nav className="flex justify-center border-b border-gray-200">
      {tabItems.map((t) => (
        <button
          key={t.key}
          className={clsx(
            "py-3 px-4 sm:px-6 font-semibold flex items-center gap-2 transition-all duration-150 ease-in-out -mb-px",
            currentTab === t.key
              ? "border-b-2 border-indigo-600 text-indigo-700"
              : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
          )}
          onClick={() => onTabChange(t.key as "cashiers" | "products" | "stores")}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
          <span className="sm:hidden">{t.label.substring(0, 3)}</span>
        </button>
      ))}
    </nav>
  );
}