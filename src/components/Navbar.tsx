import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserSwitcherModal } from './UserSwitcherModal';
import { NewItemModal } from './NewItemModal';
import { NotificationCenterModal } from './NotificationCenterModal';
import { Plus, User, RefreshCw, Bell, Clock } from 'lucide-react';
import { maskRegNumber } from '../utils/masking';
import { getCurrentLiveTimeString } from '../utils/time';

interface NavbarProps {
  onOpenHandoff?: (itemId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHandoff }) => {
  const {
    currentUser,
    unreadNotificationsCount,
    pendingClaimsCountForMe,
    activeHandoffsCountForMe,
    setActiveFeed,
    resetDemoData,
  } = useApp();

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'found' | 'lost'>('found');
  const [liveClock, setLiveClock] = useState(getCurrentLiveTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(getCurrentLiveTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const openReportModal = (type: 'found' | 'lost') => {
    setReportType(type);
    setIsNewItemModalOpen(true);
  };

  const totalActionCount = pendingClaimsCountForMe + activeHandoffsCountForMe;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Zone 1: Main Brand Topic requested by user */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveFeed('found')}
                className="flex items-center gap-2.5 text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm shrink-0">
                  VIT
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-[#1a1b1e] tracking-tight group-hover:text-[#1a73e8] transition-colors leading-tight">
                    VIT Lost and Found
                  </h1>
                  <div className="text-[11px] text-[#5f6368] font-medium leading-tight flex items-center gap-2">
                    <span>Vellore campus</span>
                    <span className="hidden md:inline text-[#dadce0]">·</span>
                    <span className="hidden md:flex items-center gap-1 font-mono text-[#006e2c] bg-[#e6f4ea] px-1.5 py-0.2 rounded text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] animate-pulse" />
                      Time: {liveClock}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Zone 2: Primary Actions & Active Student Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Reset demo data */}
              <button
                onClick={resetDemoData}
                title="Reset sample data with fresh live times"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#5f6368] hover:text-[#1a1b1e] hover:bg-[#f1f3f4] rounded-md transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(true)}
                className="relative p-2 text-[#5f6368] hover:text-[#1a1b1e] hover:bg-[#f1f3f4] rounded-lg transition-colors cursor-pointer"
                title="Campus Notifications & Chat Alerts"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-[#ea4335] text-white text-[10px] font-bold rounded-full font-mono animate-pulse shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Report Item Button */}
              <button
                onClick={() => openReportModal('found')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Report Item</span>
              </button>

              {/* Student Profile Switcher */}
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#dadce0] rounded-lg transition-colors text-left cursor-pointer"
                title="Switch Active VIT Student Profile"
              >
                <div className="w-7 h-7 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-[#1a1b1e] leading-tight truncate max-w-[85px] sm:max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[#5f6368] font-mono leading-tight">
                    {maskRegNumber(currentUser.regNumber)}
                  </div>
                </div>
                {totalActionCount > 0 && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#ea4335] ring-2 ring-white shrink-0 animate-pulse"
                    title={`${totalActionCount} pending reviews or meetups`}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      {isNotifModalOpen && (
        <NotificationCenterModal
          onClose={() => setIsNotifModalOpen(false)}
          onOpenHandoff={(itemId) => {
            setIsNotifModalOpen(false);
            if (onOpenHandoff) onOpenHandoff(itemId);
          }}
        />
      )}

      {/* Profile Switcher Modal */}
      {isUserModalOpen && <UserSwitcherModal onClose={() => setIsUserModalOpen(false)} />}

      {/* New Item Modal */}
      {isNewItemModalOpen && (
        <NewItemModal
          initialType={reportType}
          onClose={() => setIsNewItemModalOpen(false)}
        />
      )}
    </>
  );
};
