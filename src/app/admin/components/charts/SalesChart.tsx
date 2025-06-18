"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const SalesChart = ({ data }: any) => (
  <div className="bg-[#121418] p-5 rounded-xl border border-[#1E2228] h-96">
    <h3 className="text-lg font-semibold text-white mb-4">Динамика продаж</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2228" />
        <XAxis dataKey="date" stroke="#A0A8B8" fontSize={12} />
        <YAxis stroke="#A0A8B8" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0F1115',
            borderColor: '#1E2228',
            color: '#FFFFFF'
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Line type="monotone" dataKey="total" name="Выручка" stroke="#0066FF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);