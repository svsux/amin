import { FiDollarSign, FiShoppingCart, FiBarChart, FiPackage } from 'react-icons/fi';

const KpiCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-[#121418] p-5 rounded-xl border border-[#1E2228] flex items-center gap-4">
    <div className="bg-[#0066FF]/10 p-3 rounded-lg">
      <Icon className="h-6 w-6 text-[#0066FF]" />
    </div>
    <div>
      <p className="text-sm text-[#A0A8B8]">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export const KpiCards = ({ data }: any) => {
  if (!data) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <KpiCard title="Общая выручка" value={`${data.totalSales.toFixed(2)} ₽`} icon={FiDollarSign} />
      <KpiCard title="Кол-во транзакций" value={data.transactionCount} icon={FiShoppingCart} />
      <KpiCard title="Средний чек" value={`${data.averageCheck.toFixed(2)} ₽`} icon={FiBarChart} />
      <KpiCard title="Продано товаров" value={data.totalProductsSold} icon={FiPackage} />
    </div>
  );
};