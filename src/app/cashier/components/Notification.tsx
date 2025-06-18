"use client";

import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000); // Уведомление исчезнет через 4 секунды

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? FiCheckCircle : FiXCircle;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className={`flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} animate-fade-in-down`}>
        <Icon className="h-6 w-6 mr-3" />
        <p>{message}</p>
        <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-white/20">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Добавьте эту анимацию в ваш глобальный CSS файл (например, globals.css)
/*
@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}
*/

export default Notification;