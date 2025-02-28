import { useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PaymentComplete = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { ticketDetails } = location.state || {};
    const receiptRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!ticketDetails) {
        return <div className="text-center text-red-500">No ticket details available.</div>;
    }

    const downloadReceipt = async () => {
        setLoading(true);
        setError('');
        try {
            const element = receiptRef.current;
            const canvas = await html2canvas(element);
            const data = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(data, 'PNG', 0, 0);
            pdf.save('receipt.pdf');
        } catch (err) {
            setError('Failed to download receipt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
            <div ref={receiptRef} className="relative max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-300">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] opacity-20" />
                <div className="relative z-10 p-8 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-[#5B2600] mb-4 text-center">Tiket Pembayaran Sukses</h1>
                    <div className="flex flex-col mb-4">
                        <div className="flex items-center mb-2">
                            <Ticket className="w-5 h-5 text-[#5B2600] mr-2" />
                            <span className="font-medium">{ticketDetails.eventName}</span>
                        </div>
                        <div className="flex items-center mb-2">
                            <Calendar className="w-5 h-5 text-[#5B2600] mr-2" />
                            <span>{ticketDetails.eventDate}</span>
                        </div>
                        <div className="flex items-center mb-2">
                            <Clock className="w-5 h-5 text-[#5B2600] mr-2" />
                            <span>{ticketDetails.eventTime}</span>
                        </div>
                        <div className="flex items-center mb-2">
                            <MapPin className="w-5 h-5 text-[#5B2600] mr-2" />
                            <span>{ticketDetails.venue}</span>
                        </div>
                        <p className="text-lg font-bold text-[#5B2600]">Total Harga: Rp {ticketDetails.totalPrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Jumlah Tiket: {ticketDetails.quantity}</p>
                        <p className="text-sm text-gray-600">Nama Pembeli: {ticketDetails.buyerName}</p>
                        <p className="text-sm text-gray-600">Nomor Tiket: {ticketDetails.orderId}</p>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-[#5B2600] mb-2 text-center">QR Code</h2>
                        <div className="flex justify-center mt-2">
                            <QRCode value={JSON.stringify(ticketDetails)} size={128} />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="w-full px-4 py-2 bg-[#5B2600] text-white rounded-lg hover:bg-[#4A3427] transition-colors"
                    >
                        Lihat Tiket Saya
                    </button>
                </div>

                <button 
                    onClick={downloadReceipt} 
                    className="mt-4 w-full py-3 bg-[#5B2600] text-white rounded-lg hover:bg-[#4A3427] transition-colors"
                >
                    {loading ? 'Downloading...' : 'Download Receipt'}
                </button>

                {error && <p className="mt-2 text-red-500 text-sm text-center">{error}</p>}
            </div>
    );
};

export default PaymentComplete; 