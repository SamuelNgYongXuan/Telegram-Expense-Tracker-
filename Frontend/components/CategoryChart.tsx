"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";

interface Category {
  name: string;
  amount: number;
  color: string;
  percent: number;
}

interface CategoryChartProps {
  categories: Category[];
}

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#1a1a1a" className="text-sm font-semibold" style={{ fontSize: 14, fontWeight: 600 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" style={{ fontSize: 12 }}>
        ${value.toFixed(2)}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill={fill} style={{ fontSize: 12, fontWeight: 600 }}>
        {(percent).toFixed(1)}%
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 13}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function CategoryChart({ categories }: CategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Spending by Category</h2>
        <p className="text-xs text-gray-400 mt-0.5">Where your money went</p>
      </div>

      {/* Donut chart */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={categories}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            dataKey="amount"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onTouchStart={(_, index) => setActiveIndex(index as number)}
          >
            {categories.map((cat, i) => (
              <Cell key={cat.name} fill={cat.color} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Category list */}
      <div className="mt-2 space-y-3">
        {categories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveIndex(i)}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-xl transition-colors hover:bg-gray-50 active:bg-gray-100 min-h-[44px]"
          >
            <span
              className="flex-shrink-0 w-3 h-3 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 text-sm font-medium text-gray-700 text-left">
              {cat.name}
            </span>
            <span className="text-xs text-gray-400 mr-2">{cat.percent.toFixed(1)}%</span>
            <span className="text-sm font-semibold text-gray-900">
              ${cat.amount.toFixed(2)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
