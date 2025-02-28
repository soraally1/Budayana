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
    const qrCodeRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Create QR code data with direct URL
    const getQRData = () => {
        const baseUrl = window.location.origin;
        const ticketUrl = `${baseUrl}/ticket/${ticketDetails.orderId}`;
        return ticketUrl;
    };

    // Function to capture QR code separately for better quality
    const captureQRCode = async () => {
        if (!qrCodeRef.current) return null;
        try {
            // Create a white background div
            const container = document.createElement('div');
            container.style.background = 'white';
            container.style.padding = '20px';
            container.style.display = 'inline-block';
            
            // Clone the QR code element
            const qrClone = qrCodeRef.current.cloneNode(true);
            container.appendChild(qrClone);
            document.body.appendChild(container);

            const canvas = await html2canvas(container, {
                scale: 10, // Increased scale for even better quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            document.body.removeChild(container);
            return canvas.toDataURL('image/png', 1.0);
        } catch (error) {
            console.error('QR Code capture error:', error);
            return null;
        }
    };

    if (!ticketDetails) {
        return <div className="text-center text-red-500">No ticket details available.</div>;
    }

    const downloadReceipt = async () => {
        setLoading(true);
        setError('');
        try {
            // First capture QR code
            const qrCodeImage = await captureQRCode();
            if (!qrCodeImage) {
                throw new Error('Failed to capture QR code');
            }

            const element = receiptRef.current;
            const canvas = await html2canvas(element, {
                scale: 3,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            // Create PDF with proper dimensions (A4)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Add background pattern
            pdf.setFillColor(251, 251, 251);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            // Add watermark
            const watermarkText = 'BUDAYANA';
            pdf.setTextColor(230, 230, 230);
            pdf.setFontSize(60);
            pdf.setFont(undefined, 'bold');
            
            // Calculate watermark position for rotation
            const watermarkWidth = pdf.getStringUnitWidth(watermarkText) * 60 / pdf.internal.scaleFactor;
            const x = (pageWidth - watermarkWidth) / 2;
            const y = pageHeight / 2;
            
            // Add rotated watermark
            pdf.saveGraphicsState();
            pdf.setGState(new pdf.GState({ opacity: 0.2 }));
            pdf.text(watermarkText, x, y, {
                angle: -45,
                align: 'center'
            });
            pdf.restoreGraphicsState();
            
            // Add decorative border
            pdf.setDrawColor(91, 38, 0);
            pdf.setLineWidth(0.5);
            pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
            
            // Add header
            pdf.setFillColor(91, 38, 0);
            pdf.rect(0, 0, pageWidth, 40, 'F');
            
            // Add logo text in header
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont(undefined, 'bold');
            pdf.text('BUDAYANA', 20, 25);
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            pdf.text('Your Cultural Event Partner', 20, 35);
            
            // Add ticket details section title
            pdf.setTextColor(91, 38, 0);
            pdf.setFontSize(18);
            pdf.setFont(undefined, 'bold');
            pdf.text('E-TICKET DETAILS', 20, 55);
            
            // Add horizontal line
            pdf.setDrawColor(91, 38, 0);
            pdf.setLineWidth(0.5);
            pdf.line(20, 60, pageWidth - 20, 60);
            
            // Calculate dimensions for the ticket image
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const xPos = (pageWidth - imgWidth) / 2;
            const yPos = 70;
            
            // Add the ticket image
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xPos, yPos, imgWidth, imgHeight);
            
            // Add QR code section with enhanced styling
            const qrY = yPos + imgHeight + 15;
            
            // Add QR code container with gradient background
            pdf.setFillColor(251, 246, 240);
            pdf.roundedRect(15, qrY - 5, pageWidth - 30, 80, 3, 3, 'F');
            
            // Add decorative elements - top line
            pdf.setDrawColor(91, 38, 0);
            pdf.setLineWidth(0.2);
            pdf.line(25, qrY + 15, pageWidth - 25, qrY + 15);
            
            // Add QR code title
            pdf.setTextColor(91, 38, 0);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('SCAN FOR DIGITAL TICKET', pageWidth/2, qrY + 8, { align: 'center' });
            
            // Add QR code with white background
            const qrSize = 50;
            const qrX = 35;
            const qrY_pos = qrY + 25;
            
            // Add white background for QR code
            pdf.setFillColor(255, 255, 255);
            pdf.rect(qrX - 2, qrY_pos - 2, qrSize + 4, qrSize + 4, 'F');
            
            // Add QR code
            pdf.addImage(qrCodeImage, 'PNG', qrX, qrY_pos, qrSize, qrSize);
            
            // Add instructions and details on the right
            const textX = qrX + qrSize + 20;
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text('How to use:', textX, qrY_pos + 10);
            
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            const instructions = [
                '1. Open your phone camera',
                '2. Point it at the QR code',
                '3. Click the notification that appears',
                '4. View your digital ticket details'
            ];
            
            instructions.forEach((text, index) => {
                pdf.text(text, textX, qrY_pos + 20 + (index * 8));
            });
            
            // Add ticket ID below QR code
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Ticket ID: ${ticketDetails.orderId}`, qrX + (qrSize/2), qrY_pos + qrSize + 8, { align: 'center' });
            
            // Add important notice with box
            const noticeY = qrY + 90;
            pdf.setDrawColor(91, 38, 0);
            pdf.setFillColor(251, 246, 240);
            pdf.setLineWidth(0.1);
            pdf.roundedRect(15, noticeY - 5, pageWidth - 30, 40, 3, 3, 'FD');
            
            pdf.setFontSize(10);
            pdf.setTextColor(91, 38, 0);
            pdf.setFont(undefined, 'bold');
            pdf.text('IMPORTANT NOTICE:', 20, noticeY + 5);
            
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(8);
            const notices = [
                '1. This e-ticket is valid only for the event and date specified above.',
                '2. Please present this ticket (printed or digital) along with valid ID at the venue.',
                '3. This ticket cannot be transferred or resold.',
                '4. Entry may be refused if ticket is damaged or altered.',
                '5. By using this ticket, you agree to follow all venue and event regulations.'
            ];
            notices.forEach((notice, index) => {
                pdf.text(notice, 20, noticeY + 12 + (index * 5));
            });
            
            // Add footer with dynamic content
            const footerY = pageHeight - 20;
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.1);
            pdf.line(20, footerY - 10, pageWidth - 20, footerY - 10);
            
            // Footer text
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            
            // Left side - Timestamp
            const timestamp = new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'full',
                timeStyle: 'short'
            });
            pdf.text(`Generated on: ${timestamp}`, 20, footerY);
            
            // Center - Website
            pdf.text('www.budayana.id', pageWidth/2, footerY, { align: 'center' });
            
            // Right side - Page number
            pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' });
            
            // Save the PDF with formatted name
            const formattedDate = new Date().toISOString().split('T')[0];
            pdf.save(`Budayana-Ticket-${ticketDetails.orderId}-${formattedDate}.pdf`);
            
        } catch (error) {
            console.error('PDF generation error:', error);
            setError('Failed to download receipt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Main Ticket Container */}
                <div ref={receiptRef} className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                    {/* Ticket Header */}
                    <div className="bg-gradient-to-r from-[#5B2600] to-[#8B4513] p-6 text-white">
                        <h1 className="text-2xl font-bold text-center">Tiket Pembayaran Sukses</h1>
                    </div>

                    {/* Decorative Tear Line */}
                    <div className="relative">
                        <div className="absolute left-0 right-0 h-4">
                            <div className="absolute top-0 left-0 right-0 flex justify-between">
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-gray-200 rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-8 pt-12">
                        {/* Event Details Section */}
                        <div className="space-y-6">
                            <div className="flex items-center bg-[#5B2600]/5 p-4 rounded-lg">
                                <Ticket className="w-6 h-6 text-[#5B2600] mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Event</p>
                                    <p className="font-semibold text-[#5B2600]">{ticketDetails.eventName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#5B2600]/5 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-[#5B2600] mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Tanggal</p>
                                            <p className="font-medium">{ticketDetails.eventDate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#5B2600]/5 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-[#5B2600] mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Waktu</p>
                                            <p className="font-medium">{ticketDetails.eventTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#5B2600]/5 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 text-[#5B2600] mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">Lokasi</p>
                                        <p className="font-medium">{ticketDetails.venue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price and Quantity Section */}
                        <div className="mt-8 p-4 border-t border-dashed border-gray-300">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Total Harga:</span>
                                <span className="text-xl font-bold text-[#5B2600]">
                                    Rp {ticketDetails.totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Jumlah Tiket:</span>
                                <span>{ticketDetails.quantity}</span>
                            </div>
                        </div>

                        {/* Buyer Details Section */}
                        <div className="mt-6 p-4 bg-[#5B2600]/5 rounded-lg">
                            <p className="text-sm text-gray-600">Nama Pembeli: <span className="font-medium">{ticketDetails.buyerName}</span></p>
                            <p className="text-sm text-gray-600">Nomor Tiket: <span className="font-medium">{ticketDetails.orderId}</span></p>
                        </div>

                        {/* QR Code Section with ref for separate capture */}
                        <div className="mt-8 flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold text-[#5B2600] mb-4">Scan QR Code</h2>
                            <div ref={qrCodeRef} className="p-4 bg-white rounded-lg shadow-sm border-2 border-[#5B2600]/10">
                                <QRCode 
                                    value={getQRData()}
                                    size={160}
                                    level="H"
                                    fgColor="#5B2600"
                                />
                            </div>
                            <p className="mt-4 text-sm text-gray-600 text-center">
                                Scan QR code untuk melihat detail tiket
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-4">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="w-full px-6 py-3 bg-[#5B2600] text-white rounded-lg hover:bg-[#4A3427] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                    >
                        Lihat Tiket Saya
                    </button>

                    <button 
                        onClick={downloadReceipt} 
                        className="w-full px-6 py-3 bg-white text-[#5B2600] border-2 border-[#5B2600] rounded-lg hover:bg-[#5B2600] hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                    >
                        {loading ? 'Downloading...' : 'Download Receipt'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentComplete; 