// import React from 'react'; // Removed React import
import TicketCard from './TicketCard';
import { Calendar, History } from 'lucide-react';
import PropTypes from 'prop-types';

const TicketList = ({ tickets, activeTab, setActiveTab, loadingTickets }) => {
  return (
    <div className="md:col-span-2 space-y-6">
      {/* Tabs */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-xl font-fuzzy text-sm transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-[#5B2600] text-white'
              : 'text-[#5B2600] hover:bg-[#5B2600]/10'
          }`}
        >
          Tiket Mendatang
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-xl font-fuzzy text-sm transition-colors ${
            activeTab === 'history'
              ? 'bg-[#5B2600] text-white'
              : 'text-[#5B2600] hover:bg-[#5B2600]/10'
          }`}
        >
          Riwayat Tiket
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loadingTickets ? (
          <div className="text-center py-4">
            <p>Loading tickets...</p>
          </div>
        ) : tickets[activeTab].length > 0 ? (
          tickets[activeTab].map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              {activeTab === 'upcoming' ? (
                <Calendar className="w-12 h-12 text-gray-400" />
              ) : (
                <History className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <p className="text-gray-600 font-fuzzy">
              {activeTab === 'upcoming'
                ? 'Belum ada tiket mendatang'
                : 'Belum ada riwayat tiket'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

TicketList.propTypes = {
  tickets: PropTypes.shape({
    upcoming: PropTypes.array.isRequired,
    history: PropTypes.array.isRequired,
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  loadingTickets: PropTypes.bool.isRequired,
};

export default TicketList; 