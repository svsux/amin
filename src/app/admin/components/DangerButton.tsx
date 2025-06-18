import clsx from "clsx";

export default function DangerButton({ children, onClick, disabled = false, className = "" }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "text-[#FF3B30] hover:text-red-400 font-semibold transition-colors flex items-center gap-1 disabled:text-gray-600 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}