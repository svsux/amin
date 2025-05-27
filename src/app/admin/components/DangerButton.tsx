import clsx from "clsx";

export default function DangerButton({ children, onClick, disabled = false, className = "" }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "text-red-600 hover:text-red-800 font-semibold transition-colors flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}