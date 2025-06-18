"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const TopProductsChart = ({ data }: any) => (
  <div className="bg-[#121418] p-5 rounded-xl border border-[#1E2228] h-96">
    <h3 className="text-lg font-semibold text-white mb-4">Топ-5 продаваемых товаров</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2228" />
        <XAxis type="number" stroke="#A0A8B8" fontSize={12} />
        <YAxis type="category" dataKey="name" stroke="#A0A8B8" fontSize={12} width={120} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0F1115',
            borderColor: '#1E2228',
            color: '#FFFFFF'
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Bar dataKey="quantity" name="Продано (шт)" fill="#0066FF" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);