import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, MessageSquare, ShieldCheck, CheckCircle } from 'lucide-react';

interface NotificationToastProps {
  onOpenHandoff?: (itemId: string) => void;
  onOpenItem?: (itemId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  onOpenHandoff,
  onOpenItem,
}) => {
  const { activeToast, dismissToast, markNotificationAsRead } = useApp();

  if (!activeToast) return null;

  const handleClick = () => {
    markNotificationAsRead(activeToast.id);
    if (activeToast.type === 'chat_message' || activeToast.type === 'new_claim' || activeToast.type === 'claim_approved') {
      if (onOpenHandoff) onOpenHandoff(activeToast.itemId);
    } else if (onOpenItem) {
      onOpenItem(activeToast.itemId);
    }
    dismissToast();
  };

  const isChat = activeToast.type === 'chat_message';
  const isApproved = activeToast.type === 'claim_approved';

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="bg-white border-2 border-[#1a73e8] rounded-2xl p-4 shadow-xl flex items-start gap-3 relative">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isApproved ? 'bg-[#e6f4ea] text-[#006e2c]' : isChat ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#fff0eb] text-[#ea4335]'
        }`}>
          {isApproved ? (
            <CheckCircle className="w-5 h-5" />
          ) : isChat ? (
            <MessageSquare className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a73e8]">
              Campus Alert
            </span>
            <span className="text-[10px] text-[#727785] font-mono">{activeToast.timestamp}</span>
          </div>

          <h4 className="text-xs font-bold text-[#1a1b1e] leading-snug truncate">
            {activeToast.title}
          </h4>

          <p className="text-xs text-[#5f6368] mt-1 line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>

          <div className="pt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Open Chat / View</span>
            </button>
            <button
              type="button"
              onClick={dismissToast}
              className="text-xs text-[#727785] hover:text-[#1a1b1e] px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="absolute top-3 right-3 text-[#727785] hover:text-[#1a1b1e] p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
