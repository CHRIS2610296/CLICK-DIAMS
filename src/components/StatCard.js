// StatCard.jsx
export default function StatCard({ 
  icon, 
  value, 
  label, 
  color = 'green', 
  trend, 
  backgroundImage 
}) {
  const colorClasses = {
    green: 'from-green-500/30 to-emerald-600/30',
    blue: 'from-blue-500/30 to-sky-600/30',
    purple: 'from-purple-500/30 to-violet-600/30',
    orange: 'from-orange-500/30 to-amber-600/30'
  };

  return (
    <div className="relative overflow-hidden rounded-2xl group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]}`}></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative p-5 sm:p-6 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/30">
            {icon}
          </div>
          {trend && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30 ${
              trend > 0 ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold drop-shadow-lg">{value}</div>
          <div className="text-white/90 text-sm sm:text-base mt-1">{label}</div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
}