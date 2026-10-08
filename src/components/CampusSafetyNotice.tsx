import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export const CampusSafetyNotice: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#dadce0] rounded-xl p-4 shadow-xs mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#1a1b1e] flex items-center gap-2">
            <span>How VIT Lost & Found Works</span>
            <span className="text-[11px] font-semibold text-[#006e2c] bg-[#e6f4ea] px-2 py-0.5 rounded-full">
              Safe & Private
            </span>
          </h2>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Lost an item or found one? We help you connect safely without sharing your personal phone or email.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#1a73e8] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>{isExpanded ? 'Hide Steps' : 'See 3 Easy Steps'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 mt-3 border-t border-[#efedf1] text-xs">
          <div className="bg-[#faf9fd] p-3 rounded-lg border border-[#efedf1]">
            <div className="font-bold text-[#1a1b1e] mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#1a73e8] text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Post or Search</span>
            </div>
            <p className="text-[#5f6368] leading-relaxed">
              Browse by building (SJT, TT, Hostels) or item type. Your contact info stays masked for privacy.
            </p>
          </div>

          <div className="bg-[#faf9fd] p-3 rounded-lg border border-[#efedf1]">
            <div className="font-bold text-[#1a1b1e] mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#1a73e8] text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Answer Secret Question</span>
            </div>
            <p className="text-[#5f6368] leading-relaxed">
              To prove it's yours, answer the finder's custom question (e.g. name on ID, stickers, or key tags).
            </p>
          </div>

          <div className="bg-[#faf9fd] p-3 rounded-lg border border-[#efedf1]">
            <div className="font-bold text-[#1a1b1e] mb-1 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#1a73e8] text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Pick Up Safely</span>
            </div>
            <p className="text-[#5f6368] leading-relaxed">
              Once approved, chat inside the app and meet at SJT Reception or Library Security Desk.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
