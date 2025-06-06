
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LivePriceSectionProps {
  livePrice: number;
  priceChange: number;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export const LivePriceSection = ({ livePrice, priceChange, selectedTimeframe, onTimeframeChange }: LivePriceSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-[#1F1F1E] to-[#2A2A29] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 border border-[#3A3935]/50">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <h2 className="text-lg sm:text-xl font-semibold">EUR/USD</h2>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#7EBF8E]/20 text-[#7EBF8E] rounded-full text-xs sm:text-sm font-medium">
              Live
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">{livePrice}</span>
            <span className={`text-sm sm:text-lg font-medium flex items-center gap-1 ${priceChange >= 0 ? 'text-[#7EBF8E]' : 'text-red-500'}`}>
              {priceChange >= 0 ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
              {Math.abs(priceChange).toFixed(4)} ({((priceChange / livePrice) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
          {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-md lg:rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                selectedTimeframe === tf
                  ? 'bg-[#8989DE] text-white'
                  : 'bg-[#3A3935]/50 hover:bg-[#3A3935] text-[#E6E4DD]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
