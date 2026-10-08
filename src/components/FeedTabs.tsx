import React from 'react';
import { useApp } from '../context/AppContext';

export const FeedTabs: React.FC = () => {
  const {
    activeFeed,
    setActiveFeed,
    items,
    currentUser,
    pendingClaimsCountForMe,
    activeHandoffsCountForMe,
  } = useApp();

  const foundCount = items.filter((i) => i.type === 'found' && i.status !== 'resolved').length;
  const lostCount = items.filter((i) => i.type === 'lost' && i.status !== 'resolved').length;
  const myTotalCount = items.filter(
    (i) =>
      (i.reporter.studentId === currentUser.id ||
        i.claims.some((c) => c.claimantStudentId === currentUser.id)) &&
      i.status !== 'resolved'
  ).length;
  const resolvedCount = items.filter((i) => i.status === 'resolved').length;

  const myNotifications = pendingClaimsCountForMe + activeHandoffsCountForMe;

  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#efedf1] rounded-xl overflow-x-auto mb-4 scrollbar-none">
      <button
        type="button"
        onClick={() => setActiveFeed('found')}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
          activeFeed === 'found'
            ? 'bg-white text-[#1a1b1e] shadow-xs'
            : 'text-[#414754] hover:text-[#1a1b1e]'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#34a853]" />
        <span>Found Items</span>
        <span className="text-[#5f6368] font-mono text-[11px]">({foundCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveFeed('lost')}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
          activeFeed === 'lost'
            ? 'bg-white text-[#1a1b1e] shadow-xs'
            : 'text-[#414754] hover:text-[#1a1b1e]'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#ea4335]" />
        <span>Lost Items</span>
        <span className="text-[#5f6368] font-mono text-[11px]">({lostCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveFeed('my-reports')}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
          activeFeed === 'my-reports' || activeFeed === 'my-claims'
            ? 'bg-white text-[#1a1b1e] shadow-xs'
            : 'text-[#414754] hover:text-[#1a1b1e]'
        }`}
      >
        <span>My Activity</span>
        <span className="text-[#5f6368] font-mono text-[11px]">({myTotalCount})</span>
        {myNotifications > 0 && (
          <span className="px-1.5 py-0.2 bg-[#ea4335] text-white text-[10px] font-bold rounded-full font-mono">
            {myNotifications} action{myNotifications > 1 ? 's' : ''}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveFeed('resolved')}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
          activeFeed === 'resolved'
            ? 'bg-white text-[#1a1b1e] shadow-xs'
            : 'text-[#414754] hover:text-[#1a1b1e]'
        }`}
      >
        <span>Returned Archive</span>
        <span className="text-[#5f6368] font-mono text-[11px]">({resolvedCount})</span>
      </button>
    </div>
  );
};
