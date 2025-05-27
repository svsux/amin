import clsx from "clsx";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

function FiInfo(props: any) {
  return <FiAlertCircle {...props} className={clsx(props.className, "text-blue-500")} />;
}

export default function Alert({ message, type }: { message: string | null; type: "success" | "error" | "info" }) {
  if (!message) return null;
  const baseClasses = "rounded px-4 py-3 mb-4 text-sm font-medium shadow-md flex items-center gap-2";
  const typeClasses = {
    success: "bg-green-100 text-green-800 border border-green-300",
    error: "bg-red-100 text-red-800 border border-red-300",
    info: "bg-blue-100 text-blue-800 border border-blue-300",
  };
  const Icon = type === "success" ? FiCheckCircle : type === "error" ? FiAlertCircle : FiInfo;

  return (
    <div className={clsx(baseClasses, typeClasses[type])}>
      <Icon className="h-5 w-5" />
      {message}
    </div>
  );
}