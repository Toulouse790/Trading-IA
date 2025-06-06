
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  icon: any;
  title: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard = ({ icon: Icon, title, value, change, trend, color = 'primary' }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-[#8989DE]/10 text-[#8989DE]',
    success: 'bg-[#7EBF8E]/10 text-[#7EBF8E]',
    warning: 'bg-[#D2886F]/10 text-[#D2886F]',
    danger: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50 hover:border-[#8989DE]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#8989DE]/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-[#E6E4DD] text-sm font-medium">{title}</p>
          </div>
          <p className="text-2xl font-bold text-[#FAFAF8]">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-[#7EBF8E]" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-[#7EBF8E]' : 'text-red-500'}`}>
                {change}%
              </span>
              <span className="text-xs text-[#605F5B]">vs hier</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
