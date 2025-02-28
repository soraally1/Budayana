import PropTypes from 'prop-types';

const TicketCard = ({ ticket }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="text-lg font-bold text-[#5B2600]">{ticket.title}</h2>
      <p className="text-gray-600">Event Date: {new Date(ticket.eventDate).toLocaleDateString('id-ID')}</p>
      <p className="text-gray-600">Location: {ticket.location}</p>
      <p className="text-gray-600">Status: {ticket.status}</p>
      <p className="text-gray-600">Price: {ticket.price} IDR</p>
    </div>
  );
};

TicketCard.propTypes = {
  ticket: PropTypes.shape({
    title: PropTypes.string.isRequired,
    eventDate: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default TicketCard; 