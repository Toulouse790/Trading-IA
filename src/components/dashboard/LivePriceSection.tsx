
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LivePriceSectionProps {
  livePrice: number;
  priceChange: number;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export const LivePriceSection = ({ livePrice, priceChange, selectedTimeframe, onTimeframeChange }: LivePriceSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-[#1F1F1E] to-[#2A2A29] rounded-2xl p-6 mb-6 border border-[#3A3935]/50">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold">EUR/USD</h2>
            <span className="px-3 py-1 bg-[#7EBF8E]/20 text-[#7EBF8E] rounded-full text-sm font-medium">
              Live
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">{livePrice}</span>
            <span className={`text-lg font-medium flex items-center gap-1 ${priceChange >= 0 ? 'text-[#7EBF8E]' : 'text-red-500'}`}>
              {priceChange >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {Math.abs(priceChange).toFixed(4)} ({((priceChange / livePrice) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
