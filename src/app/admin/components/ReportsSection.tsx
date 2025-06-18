"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminShiftReportModal, { AdminReportData } from './AdminShiftReportModal';
import ConfirmDialog from './ConfirmDialog';
import { FiBarChart2, FiTrash, FiSearch, FiRefreshCw } from 'react-icons/fi';
import Alert from './Alert';

// Динамическая загрузка компонентов графиков
const KpiCards = dynamic(() => import('./charts/KpiCards').then(mod => mod.KpiCards), { ssr: false });
const SalesChart = dynamic(() => import('./charts/SalesChart').then(mod => mod.SalesChart), { ssr: false });
const TopProductsChart = dynamic(() => import('./charts/TopProductsChart').then(mod => mod.TopProductsChart), { ssr: false });

const ReportsSection = () => {
  const [reports, setReports] = useState<AdminReportData[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedReport, setSelectedReport] = useState<AdminReportData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        fetch(`/api/admin/statistics?startDate=${start}&endDate=${end}`),
        fetch(`/api/admin/reports?startDate=${start}&endDate=${end}`)
      ]);

      if (!statsRes.ok || !reportsRes.ok) {
        throw new Error('Ошибка при загрузке данных.');
      }

      const statsData = await statsRes.json();
      const reportsData = await reportsRes.json();

      setStatsData(statsData);
      setReports(reportsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, []);

  const handleSearch = () => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    } else {
      setError('Пожалуйста, выберите начальную и конечную даты.');
    }
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(weekAgo);
    setEndDate(today);
    setError(null);
    fetchData(weekAgo, today);
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
      setError(null);
      const response = await fetch(`/api/admin/reports/${reportToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Не удалось удалить отчет.');
      }
      setReports(reports.filter(report => report.id !== reportToDelete));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsConfirmOpen(false);
      setReportToDelete(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-[#121418] rounded-lg border border-[#1E2228]">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-[#0F1115] border border-[#1E2228] rounded-md shadow-sm text-white placeholder:text-[#A0A8B8]/50 focus:outline-none focus:ring-2 focus:ring-[#0066FF] px-3 py-2"
        />
        <span className="text-[#A0A8B8]">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-[#0F1115] border border-[#1E2228] rounded-md shadow-sm text-white placeholder:text-[#A0A8B8]/50 focus:outline-none focus:ring-2 focus:ring-[#0066FF] px-3 py-2"
        />
        <button onClick={handleSearch} className="flex items-center gap-2 px-4 py-2 bg-[#0066FF] text-white rounded-md hover:bg-blue-500 transition-colors">
          <FiSearch /> Применить
        </button>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-[#1E2228] text-[#A0A8B8] rounded-md hover:bg-[#1E2228]/70 transition-colors">
          <FiRefreshCw /> Сбросить (7 дней)
        </button>
      </div>

      {error && <Alert message={error} type="error" />}

      {/* Дашборд */}
      {loading ? (
        <p className="text-center text-[#A0A8B8] py-6">Загрузка аналитики...</p>
      ) : statsData && (
        <div className="space-y-6">
          <KpiCards data={statsData.kpi} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart data={statsData.dailySales} />
            <TopProductsChart data={statsData.topProducts} />
          </div>
        </div>
      )}

      {/* Список смен */}
      <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FiBarChart2 className="text-[#0066FF]" />
          Детализация по сменам
        </h2>
        {loading ? (
          <p className="text-center text-[#A0A8B8] py-6">Загрузка смен...</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {reports.length > 0 ? (
              reports.map(report => (
                <div key={report.id} className="border border-[#1E2228] p-4 rounded-lg flex justify-between items-center bg-[#121418] hover:bg-[#1E2228]/60 transition-colors">
                  <div>
                    <p className="font-semibold text-white">Кассир: {report.cashierName}</p>
                    <p className="text-sm text-[#A0A8B8]">
                      Закрыта: {new Date(report.closedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-400">{report.totalSales.toFixed(2)}₽</p>
                      <button
                        onClick={() => handleViewReport(report)}
                        className="text-sm text-[#0066FF] hover:text-blue-400 font-medium"
                      >
                        Подробнее
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(report.id)}
                      className="p-2 text-[#FF3B30] hover:text-red-400 hover:bg-[#FF3B30]/20 rounded-full transition-colors"
                      title="Удалить отчет"
                    >
                      <FiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#A0A8B8] py-6">Отчетов по заданным критериям не найдено.</p>
            )}
          </div>
        )}
      </div>
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