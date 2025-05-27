import clsx from "clsx";

export default function PrimaryButton({ children, onClick, type = "button", disabled = false, className = "" }: any) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all",
        className
      )}
    >
      {children}
    </button>
  );
}