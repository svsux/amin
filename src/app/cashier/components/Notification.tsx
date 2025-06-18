"use client";

import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // После анимации исчезновения вызываем onDismiss
  useEffect(() => {
    if (!visible) {
      const timeout = setTimeout(onDismiss, 400); // 400ms = длительность анимации
      return () => clearTimeout(timeout);
    }
  }, [visible, onDismiss]);

  const isSuccess = type === 'success';
  const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';
  const Icon = isSuccess ? FiCheckCircle : FiXCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Затемнение фона */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-60 transition-opacity ${
          visible ? "animate-fade-in" : "animate-fade-out"
        }`}
        onClick={() => setVisible(false)}
      />
      {/* Само уведомление */}
      <div
        className={`
          relative flex items-center gap-3 px-7 py-6 rounded-2xl shadow-2xl
          bg-[#23262B]/90 backdrop-blur-md border border-[#2e3140] text-white
          transition-all duration-300 max-w-md w-full
          ${visible ? "animate-fade-in-down" : "animate-fade-out-up"}
        `}
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        }}
      >
        <Icon className={`h-8 w-8 ${iconColor} drop-shadow`} />
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
};

/*
Добавьте в globals.css:

@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s cubic-bezier(.4,2,.3,1) forwards;
}

@keyframes fade-out-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
  }
}
.animate-fade-out-up {
  animation: fade-out-up 0.4s cubic-bezier(.4,2,.3,1) forwards;
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.3s ease forwards;
}

@keyframes fade-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
.animate-fade-out {
  animation: fade-out 0.4s ease forwards;
}
*/

export default Notification;