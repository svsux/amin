import clsx from "clsx";

export default function PrimaryButton({ children, onClick, type = "button", disabled = false, className = "" }: any) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#0066FF] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-[#1E2228] disabled:text-[#A0A8B8]/60 disabled:cursor-not-allowed transition-all",
        className
      )}
    >
      {children}
    </button>
  );
}