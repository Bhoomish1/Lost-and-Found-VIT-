import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { FeedTabs } from './components/FeedTabs';
import { FilterBar } from './components/FilterBar';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ClaimModal } from './components/ClaimModal';
import { ClaimsReviewModal } from './components/ClaimsReviewModal';
import { HandoffCoordinationModal } from './components/HandoffCoordinationModal';
import { CampusSafetyNotice } from './components/CampusSafetyNotice';
import { MyActivityView } from './components/MyActivityView';
import { LostFoundItem } from './types';
import { Search } from 'lucide-react';

interface MainContentProps {
  onOpenDetails: (item: LostFoundItem) => void;
  onOpenClaim: (item: LostFoundItem) => void;
  onOpenReviews: (item: LostFoundItem) => void;
  onOpenHandoff: (item: LostFoundItem) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  onOpenDetails,
  onOpenClaim,
  onOpenReviews,
  onOpenHandoff,
}) => {
  const {
    items,
    activeFeed,
    searchQuery,
    selectedCategory,
    selectedVenueZone,
    currentUser,
  } = useApp();

  // Filter items based on active feed, search, category, and venue zone
  const filteredItems = items.filter((item) => {
    // 1. Feed filter
    if (activeFeed === 'found') {
      if (item.type !== 'found' || item.status === 'resolved') return false;
    } else if (activeFeed === 'lost') {
      if (item.type !== 'lost' || item.status === 'resolved') return false;
    } else if (activeFeed === 'my-reports' || activeFeed === 'my-claims') {
      const isMyReport = item.reporter.studentId === currentUser.id;
      const isMyClaim = item.claims.some((c) => c.claimantStudentId === currentUser.id);
      if ((!isMyReport && !isMyClaim) || item.status === 'resolved') return false;
    } else if (activeFeed === 'resolved') {
      if (item.status !== 'resolved') return false;
    } else if (activeFeed === 'all') {
      if (item.status === 'resolved') return false;
    }

    // 2. Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // 3. Venue Zone filter
    if (selectedVenueZone !== 'all' && item.venueZone !== selectedVenueZone) {
      return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchVenue = item.venueCode.toLowerCase().includes(query);
      const matchSpecific = item.specificLocation.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      if (!matchTitle && !matchVenue && !matchSpecific && !matchCat && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  const getFeedHeading = () => {
    switch (activeFeed) {
      case 'found':
        return {
          title: 'Found Items on Campus',
          desc: 'Belongings found around VIT waiting to be claimed by their owners.',
        };
      case 'lost':
        return {
          title: 'Lost Belongings',
          desc: 'Items reported missing. If you found one, answer or verify to help return it.',
        };
      case 'my-reports':
      case 'my-claims':
        return {
          title: 'My Campus Activity',
          desc: 'Items you posted, answers waiting for your review, and active pickup chats.',
        };
      case 'resolved':
        return {
          title: 'Returned Archive',
          desc: 'Belongings verified and successfully handed over at campus security desks.',
        };
      default:
        return {
          title: 'All Campus Items',
          desc: 'Browse lost and found belongings across VIT.',
        };
    }
  };

  const feedMeta = getFeedHeading();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Protocol Notice */}
      <CampusSafetyNotice />

      {/* Feed Tabs & Segmented Switchers */}
      <FeedTabs />

      {/* Filter and Search Bar */}
      <FilterBar />

      {/* Feed Section Title */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h1 className="text-lg font-bold text-[#1a1b1e] tracking-tight">{feedMeta.title}</h1>
          <p className="text-xs text-[#5f6368]">{feedMeta.desc}</p>
        </div>
        <div className="text-xs text-[#5f6368] font-mono tabular-nums self-start sm:self-auto">
          Showing {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Items View */}
      {activeFeed === 'my-reports' || activeFeed === 'my-claims' ? (
        <MyActivityView
          onOpenDetails={onOpenDetails}
          onOpenReviews={onOpenReviews}
          onOpenHandoff={onOpenHandoff}
        />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onOpenDetails={onOpenDetails}
              onOpenClaim={onOpenClaim}
              onOpenReviews={onOpenReviews}
              onOpenHandoff={onOpenHandoff}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#dadce0] rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-[#f1f3f4] text-[#5f6368] rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#1a1b1e]">No items match your criteria</h3>
          <p className="text-xs text-[#5f6368] max-w-sm mx-auto">
            Try adjusting your search query, selecting a different campus zone, or checking the other feed tabs.
          </p>
        </div>
      )}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { items } = useApp();
  const [selectedDetailItem, setSelectedDetailItem] = useState<LostFoundItem | null>(null);
  const [selectedClaimItem, setSelectedClaimItem] = useState<LostFoundItem | null>(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState<LostFoundItem | null>(null);
  const [selectedHandoffItem, setSelectedHandoffItem] = useState<LostFoundItem | null>(null);

  const handleOpenHandoffById = (itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (it) {
      setSelectedDetailItem(null);
      setSelectedClaimItem(null);
      setSelectedReviewItem(null);
      setSelectedHandoffItem(it);
    }
  };

  const handleOpenItemById = (itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (it) {
      setSelectedClaimItem(null);
      setSelectedReviewItem(null);
      setSelectedHandoffItem(null);
      setSelectedDetailItem(it);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fd] text-[#1a1b1e] flex flex-col font-sans">
      <Navbar onOpenHandoff={handleOpenHandoffById} />
      <NotificationToast
        onOpenHandoff={handleOpenHandoffById}
        onOpenItem={handleOpenItemById}
      />

      <div className="flex-1">
        <MainContent
          onOpenDetails={(it) => setSelectedDetailItem(it)}
          onOpenClaim={(it) => setSelectedClaimItem(it)}
          onOpenReviews={(it) => setSelectedReviewItem(it)}
          onOpenHandoff={(it) => setSelectedHandoffItem(it)}
        />
      </div>

      {/* Modals */}
      {selectedDetailItem && (
        <ItemDetailModal
          item={items.find((i) => i.id === selectedDetailItem.id) || selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onOpenClaim={(it) => {
            setSelectedDetailItem(null);
            setSelectedClaimItem(it);
          }}
          onOpenReviews={(it) => {
            setSelectedDetailItem(null);
            setSelectedReviewItem(it);
          }}
          onOpenHandoff={(it) => {
            setSelectedDetailItem(null);
            setSelectedHandoffItem(it);
          }}
        />
      )}

      {selectedClaimItem && (
        <ClaimModal
          item={items.find((i) => i.id === selectedClaimItem.id) || selectedClaimItem}
          onClose={() => setSelectedClaimItem(null)}
          onSuccess={() => setSelectedClaimItem(null)}
          onOpenChat={(it) => {
            setSelectedClaimItem(null);
            setSelectedHandoffItem(it);
          }}
        />
      )}

      {selectedReviewItem && (
        <ClaimsReviewModal
          item={items.find((i) => i.id === selectedReviewItem.id) || selectedReviewItem}
          onClose={() => setSelectedReviewItem(null)}
          onOpenHandoff={(it) => {
            setSelectedReviewItem(null);
            setSelectedHandoffItem(it);
          }}
        />
      )}

      {selectedHandoffItem && (
        <HandoffCoordinationModal
          item={items.find((i) => i.id === selectedHandoffItem.id) || selectedHandoffItem}
          onClose={() => setSelectedHandoffItem(null)}
          onResolvedSuccess={() => setSelectedHandoffItem(null)}
        />
      )}

      {/* Clean Footer */}
      <footer className="mt-12 border-t border-[#dadce0] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5f6368]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1a1b1e]">VIT Campus Lost & Found</span>
            <span>·</span>
            <span>Vellore Institute of Technology · Vellore campus</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Security Helpline: SJT / Library Intercom</span>
            <span>·</span>
            <span>Student Privacy Masking Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
