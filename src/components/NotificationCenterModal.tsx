import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, MessageSquare, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface NotificationCenterModalProps {
  onClose: () => void;
  onOpenHandoff: (itemId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  onClose,
  onOpenHandoff,
}) => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useApp();

  // Filter notifications for current user
  const myNotifications = notifications.filter((n) => n.recipientId === currentUser.id);

  const handleItemClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    onClose();
    onOpenHandoff(notif.itemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-[#dadce0] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1b1e]">Campus Notifications</h2>
              <p className="text-xs text-[#5f6368]">
                Real-time alerts for questions, replies, and approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {myNotifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="p-1.5 text-[#5f6368] hover:text-[#ea4335] rounded-md transition-colors"
                title="Clear all alerts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#5f6368] hover:text-[#1a1b1e] rounded-md hover:bg-[#efedf1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {myNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bell className="w-10 h-10 text-[#dadce0] mx-auto" />
              <div className="text-sm font-bold text-[#1a1b1e]">No new notifications</div>
              <p className="text-xs text-[#5f6368] max-w-xs mx-auto">
                Whenever a student answers your question or replies in chat, you will be notified here instantly.
              </p>
            </div>
          ) : (
            myNotifications.map((notif) => {
              const isApproved = notif.type === 'claim_approved';
              const isChat = notif.type === 'chat_message';

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-[#1a73e8] flex items-start gap-3 ${
                    notif.read
                      ? 'bg-white border-[#dadce0]'
                      : 'bg-[#f0f6ff] border-[#1a73e8]/40 ring-1 ring-[#1a73e8]/20'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isApproved
                        ? 'bg-[#e6f4ea] text-[#006e2c]'
                        : isChat
                        ? 'bg-[#e8f0fe] text-[#1a73e8]'
                        : 'bg-[#fff0eb] text-[#ea4335]'
                    }`}
                  >
                    {isApproved ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-[#1a1b1e] truncate">{notif.title}</span>
                      <span className="text-[10px] text-[#727785] font-mono shrink-0 ml-2">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#5f6368] line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#1a73e8] flex items-center gap-1 hover:underline">
                        <span>Open Chat Room</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between text-xs text-[#5f6368]">
          <span>Logged in as: <strong>{currentUser.name}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-semibold text-[#414754] hover:bg-[#efedf1] rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
