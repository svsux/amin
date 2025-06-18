"use client";

import React, { useState, useEffect } from 'react';
import AdminShiftReportModal, { AdminReportData } from './AdminShiftReportModal';
import ConfirmDialog from './ConfirmDialog'; // Предполагается, что у вас есть этот компонент

const ReportsSection = () => {
  const [reports, setReports] = useState<AdminReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [selectedReport, setSelectedReport] = useState<AdminReportData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Состояния для удаления
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Состояния для фильтрации по дате
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      let url = '/api/admin/reports';
      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Не удалось загрузить отчеты.');
      }
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = () => {
    if (startDate && endDate) {
      fetchReports(startDate, endDate);
    } else {
      alert('Пожалуйста, выберите начальную и конечную даты.');
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    fetchReports();
  };

  const handleViewReport = (report: AdminReportData) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setReportToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      const response = await fetch(`/api/admin/reports/${reportToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Не удалось удалить отчет.');
      }
      // Обновляем список отчетов на клиенте
      setReports(reports.filter(report => report.id !== reportToDelete));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsConfirmOpen(false);
      setReportToDelete(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Отчеты по сменам</h2>
      
      {/* Фильтр по дате */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-md border">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm text-gray-700"
        />
        <span className="text-gray-500">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm text-gray-700"
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Найти
        </button>
        <button onClick={handleReset} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
          Сбросить
        </button>
      </div>

      {loading && <p>Загрузка отчетов...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}
      {!loading && !error && (
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map(report => (
              <div key={report.id} className="border p-4 rounded-md flex justify-between items-center bg-gray-50 hover:bg-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Кассир: {report.cashierName}</p>
                  <p className="text-sm text-gray-600">
                    Закрыта: {new Date(report.closedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-700">{report.totalSales.toFixed(2)}₽</p>
                    <button
                      onClick={() => handleViewReport(report)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Подробнее
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(report.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                    title="Удалить отчет"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Отчетов по заданным критериям не найдено.</p>
          )}
        </div>
      )}
      <AdminShiftReportModal
        isOpen={isModalOpen}
        reportData={selectedReport}
        onClose={() => setIsModalOpen(false)}
      />
      <ConfirmDialog
        open={isConfirmOpen}
        message="Вы уверены, что хотите удалить этот отчет? Это действие необратимо."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default ReportsSection;