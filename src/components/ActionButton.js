import React from 'react';

export default function ActionButton({ icon, label, onClick, color = "green" }) {
  const colorClasses = {
    green: "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple: "bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700",
    orange: "bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 group flex flex-col items-center justify-center gap-3 w-full`}
    >
      <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="font-bold text-sm sm:text-base">{label}</span>
    </button>
  );
}
