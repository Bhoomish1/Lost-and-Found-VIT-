import React from 'react';
import { useApp } from '../context/AppContext';
import { OFFICIAL_CATEGORIES, VENUE_ZONES } from '../data/vitVenues';
import { Search, X, MapPin, Tag } from 'lucide-react';
import { CategoryTag, VenueZone } from '../types';

export const FilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedVenueZone,
    setSelectedVenueZone,
  } = useApp();

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedVenueZone !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedVenueZone('all');
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-xl p-3 shadow-xs mb-5">
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Casio calculator, ID card, keys, wallet, room 412..."
            className="w-full pl-9 pr-8 py-2 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#1a1b1e] placeholder-[#727785] focus:outline-none focus:border-[#1a73e8] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#1a1b1e] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters (Compact side-by-side) */}
        <div className="flex items-center gap-2">
          {/* Building/Zone Dropdown */}
          <div className="relative flex-1 sm:w-48">
            <MapPin className="w-3.5 h-3.5 text-[#5f6368] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedVenueZone}
              onChange={(e) => setSelectedVenueZone(e.target.value as VenueZone | 'all')}
              className="w-full pl-8 pr-7 py-2 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs font-medium text-[#1a1b1e] focus:outline-none focus:border-[#1a73e8] cursor-pointer appearance-none truncate"
            >
              <option value="all">All Buildings</option>
              {VENUE_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5f6368] text-[10px]">
              ▼
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="relative flex-1 sm:w-44">
            <Tag className="w-3.5 h-3.5 text-[#5f6368] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryTag | 'all')}
              className="w-full pl-8 pr-7 py-2 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs font-medium text-[#1a1b1e] focus:outline-none focus:border-[#1a73e8] cursor-pointer appearance-none truncate"
            >
              <option value="all">All Categories</option>
              {OFFICIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5f6368] text-[10px]">
              ▼
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-2.5 py-2 text-xs font-semibold text-[#ea4335] hover:bg-[#ffdad6]/40 rounded-lg transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
