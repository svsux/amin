"use client";

import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import React, { useEffect, useState } from "react";

interface AlertProps {
  message: string | null;
  type: "success" | "error" | "info";
  onClose?: () => void;
}

export default function Alert({ message, type, onClose }: AlertProps) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (!visible && message && onClose) {
      const timeout = setTimeout(onClose, 400);
      return () => clearTimeout(timeout);
    }
  }, [visible, message, onClose]);

  if (!message) return null;

  const iconProps = "h-8 w-8 drop-shadow";
  const iconColor =
    type === "success"
      ? "text-green-400"
      : type === "error"
      ? "text-red-400"
      : "text-blue-400";
  const Icon =
    type === "success"
      ? FiCheckCircle
      : type === "error"
      ? FiAlertCircle
      : FiInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Затемнение */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-60 transition-opacity ${
          visible ? "animate-fade-in" : "animate-fade-out"
        }`}
        onClick={() => setVisible(false)}
      />
      {/* Уведомление */}
      <div
        className={`
          relative flex items-center gap-3 px-7 py-6 rounded-2xl shadow-2xl
          bg-[#23262B]/90 backdrop-blur-md border border-[#2e3140] text-white
          transition-all duration-300 max-w-md w-full
          ${visible ? "animate-fade-in-down" : "animate-fade-out-up"}
        `}
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
        }}
      >
        <Icon className={`${iconProps} ${iconColor}`} />
        <span className="font-medium text-lg">{message}</span>
        <button
          onClick={() => setVisible(false)}
          className="ml-4 p-2 rounded-full hover:bg-white/10 transition absolute top-2 right-2"
          aria-label="Закрыть"
        >
          <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/*
Добавьте в globals.css, если ещё не добавили:

@keyframes fade-in-down {
  0% { opacity: 0; transform: translateY(-20px);}
  100% { opacity: 1; transform: translateY(0);}
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s cubic-bezier(.4,2,.3,1) forwards;
}
@keyframes fade-out-up {
  0% { opacity: 1; transform: translateY(0);}
  100% { opacity: 0; transform: translateY(-20px);}
}
.animate-fade-out-up {
  animation: fade-out-up 0.4s cubic-bezier(.4,2,.3,1) forwards;
}
@keyframes fade-in {
  0% { opacity: 0;}
  100% { opacity: 1;}
}
.animate-fade-in {
  animation: fade-in 0.3s ease forwards;
}
@keyframes fade-out {
  0% { opacity: 1;}
  100% { opacity: 0;}
}
.animate-fade-out {
  animation: fade-out 0.4s ease forwards;
}
*/