import { useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, Loader2, Download, AlertTriangle } from 'lucide-react';
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

    // Create QR code data with direct URL and ticket details
    const getQRData = () => {
        const baseUrl = window.location.origin;
        const ticketUrl = `${baseUrl}/ticket/${ticketDetails.orderId}`;
        const qrData = {
            url: ticketUrl,
            ticketId: ticketDetails.orderId,
            eventName: ticketDetails.eventName,
            eventDate: ticketDetails.eventDate,
            eventTime: ticketDetails.eventTime,
            venue: ticketDetails.venue,
            buyerName: ticketDetails.buyerName,
            quantity: ticketDetails.quantity,
            totalPrice: ticketDetails.totalPrice
        };
        return JSON.stringify(qrData);
    };

    // Function to capture QR code separately for better quality
    const captureQRCode = async () => {
        if (!qrCodeRef.current) return null;
        try {
            // Create a white background div with padding
            const container = document.createElement('div');
            container.style.background = 'white';
            container.style.padding = '20px';
            container.style.display = 'inline-block';
            container.style.borderRadius = '12px';
            container.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            
            // Clone the QR code element
            const qrClone = qrCodeRef.current.cloneNode(true);
            container.appendChild(qrClone);
            document.body.appendChild(container);

            const canvas = await html2canvas(container, {
                scale: 10,
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
            await html2canvas(element, {
                scale: 3,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            // Create PDF with proper dimensions (A4)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Add background pattern with gradient
            pdf.setFillColor(251, 251, 251);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            // Add decorative border with gradient
            pdf.setDrawColor(91, 38, 0);
            pdf.setLineWidth(0.5);
            pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
            
            // Add header with gradient background
            pdf.setFillColor(91, 38, 0);
            pdf.rect(0, 0, pageWidth, 40, 'F');
            
            // Add pattern overlay to header
            for (let i = 0; i < pageWidth; i += 5) {
                pdf.setDrawColor(255, 255, 255, 0.1);
                pdf.line(i, 0, i, 40);
            }
            
            // Add logo text in header with enhanced styling
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont(undefined, 'bold');
            pdf.text('BUDAYANA', 20, 25);
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            pdf.text('Your Cultural Event Partner', 20, 35);
            
            // Add ticket details section with enhanced styling
            pdf.setTextColor(91, 38, 0);
            pdf.setFontSize(20);
            pdf.setFont(undefined, 'bold');
            pdf.text('E-TICKET RECEIPT', 20, 55);
            
            // Add decorative line
            pdf.setDrawColor(91, 38, 0);
            pdf.setLineWidth(0.5);
            pdf.line(20, 60, pageWidth - 20, 60);
            
            // Add ticket details in a box with more spacing
            const detailsY = 70;
            pdf.setFillColor(251, 246, 240);
            pdf.roundedRect(15, detailsY, pageWidth - 30, 50, 3, 3, 'F');
            
            // Event name with better spacing
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('Event:', 25, detailsY + 15);
            pdf.setFont(undefined, 'normal');
            pdf.text(ticketDetails.eventName, 25, detailsY + 25);
            
            // Date and Time with better spacing
            pdf.setFont(undefined, 'bold');
            pdf.text('Date & Time:', 25, detailsY + 35);
            pdf.setFont(undefined, 'normal');
            pdf.text(`${ticketDetails.eventDate} at ${ticketDetails.eventTime}`, 25, detailsY + 45);
            
            // Add price details in a separate box with better spacing
            const priceY = detailsY + 60;
            pdf.setFillColor(251, 246, 240);
            pdf.roundedRect(15, priceY, pageWidth - 30, 45, 3, 3, 'F');
            
            // Total Price with better spacing
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text('Total Amount:', 25, priceY + 15);
            pdf.setFontSize(18);
            pdf.text(`Rp ${ticketDetails.totalPrice.toLocaleString()}`, 25, priceY + 30);
            
            // Quantity and Price per Ticket
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'normal');
            const quantityText = `${Number(ticketDetails.quantity)} tickets`;
            const pricePerTicket = `Rp ${(ticketDetails.totalPrice / Number(ticketDetails.quantity)).toLocaleString()} per ticket`;
            pdf.text(`Quantity: ${quantityText}  |  ${pricePerTicket}`, 25, priceY + 40);
            
            // Add QR code section with better spacing
            const qrY = priceY + 55;
            
            // Add QR code container
            pdf.setFillColor(251, 246, 240);
            pdf.roundedRect(15, qrY, pageWidth - 30, 100, 3, 3, 'F');
            
            // Add QR code title
            pdf.setTextColor(91, 38, 0);
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('SCAN FOR DIGITAL TICKET', pageWidth/2, qrY + 20, { align: 'center' });
            
            // Add QR code with white background
            const qrSize = 45;
            const qrX = 35;
            const qrY_pos = qrY + 35;
            
            // Add white background for QR code with border
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(qrX - 5, qrY_pos - 5, qrSize + 10, qrSize + 10, 3, 3, 'FD');
            
            // Add QR code
            pdf.addImage(qrCodeImage, 'PNG', qrX, qrY_pos, qrSize, qrSize);
            
            // Add instructions next to QR code
            const textX = qrX + qrSize + 25;
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('How to use:', textX, qrY_pos);
            
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(11);
            const instructions = [
                '1. Open your phone camera',
                '2. Point it at the QR code',
                '3. Click the notification that appears',
                '4. View your digital ticket details'
            ];
            
            instructions.forEach((text, index) => {
                pdf.text(text, textX, qrY_pos + 15 + (index * 8));
            });
            
            // Add ticket ID below QR code
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Ticket ID: ${ticketDetails.orderId}`, qrX + (qrSize/2), qrY_pos + qrSize + 15, { align: 'center' });
            
            // Add horizontal line
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.1);
            const lineY = qrY_pos + qrSize + 25;
            pdf.line(20, lineY, pageWidth - 20, lineY);
            
            // Footer text with three columns
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            
            const timestamp = new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'full',
                timeStyle: 'short'
            });
            
            const footerY = lineY + 10;
            pdf.text(`Generated: ${timestamp}`, 20, footerY);
            pdf.text('www.budayana.id', pageWidth/2, footerY, { align: 'center' });
            pdf.text('Page 1 of 1', pageWidth - 20, footerY, { align: 'right' });
            
            // Save the PDF
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
                    {/* Ticket Header with Pattern */}
                    <div className="relative bg-gradient-to-r from-[#5B2600] to-[#8B4513] p-6 text-white overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#5B2600]/80 to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Ticket className="w-8 h-8 text-white/90" />
                                <h1 className="text-2xl font-bold text-center">Tiket Pembayaran Sukses</h1>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-white/80">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-sm">Pembayaran Berhasil</span>
                            </div>
                        </div>
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
                            <div className="flex items-center bg-gradient-to-r from-[#5B2600]/5 to-[#8B4513]/5 p-4 rounded-xl border border-[#5B2600]/10">
                                <div className="p-2 rounded-lg bg-[#5B2600] text-white mr-3">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Event</p>
                                    <p className="font-semibold text-[#5B2600]">{ticketDetails.eventName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-[#5B2600]/5 to-[#8B4513]/5 p-4 rounded-xl border border-[#5B2600]/10">
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-lg bg-[#5B2600] text-white mr-2">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Tanggal</p>
                                            <p className="font-medium text-[#5B2600]">{ticketDetails.eventDate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-[#5B2600]/5 to-[#8B4513]/5 p-4 rounded-xl border border-[#5B2600]/10">
                                    <div className="flex items-center">
                                        <div className="p-2 rounded-lg bg-[#5B2600] text-white mr-2">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Waktu</p>
                                            <p className="font-medium text-[#5B2600]">{ticketDetails.eventTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-[#5B2600]/5 to-[#8B4513]/5 p-4 rounded-xl border border-[#5B2600]/10">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-lg bg-[#5B2600] text-white mr-2">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Lokasi</p>
                                        <p className="font-medium text-[#5B2600]">{ticketDetails.venue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price and Quantity Section */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-[#5B2600]/5 to-[#8B4513]/5 rounded-xl border border-[#5B2600]/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Total Harga:</span>
                                <span className="text-2xl font-bold text-[#5B2600]">
                                    Rp {ticketDetails.totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Jumlah Tiket:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#5B2600]">{Number(ticketDetails.quantity)}</span>
                                    <span className="text-gray-500">tiket</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-dashed border-[#5B2600]/10">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Harga per Tiket:</span>
                                    <span className="font-medium text-[#5B2600]">
                                        Rp {(ticketDetails.totalPrice / Number(ticketDetails.quantity)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Buyer Details Section */}
                        <div className="mt-6 p-6 bg-gradient-to-r from-[#5B2600]/5 to-[#8B4513]/5 rounded-xl border border-[#5B2600]/10">
                            <h3 className="text-sm font-medium text-[#5B2600] mb-3">Detail Pembeli</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    Nama: <span className="font-medium text-[#5B2600]">{ticketDetails.buyerName}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    ID Tiket: <span className="font-medium text-[#5B2600]">{ticketDetails.orderId}</span>
                                </p>
                            </div>
                        </div>

                        {/* QR Code Section with ref for separate capture */}
                        <div className="mt-8 flex flex-col items-center bg-gradient-to-r from-[#5B2600]/5 to-[#8B4513]/5 p-8 rounded-xl border border-[#5B2600]/10">
                            <div className="p-2 rounded-lg bg-[#5B2600] text-white mb-4">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#5B2600] mb-4">Scan QR Code</h2>
                            <div ref={qrCodeRef} className="p-6 bg-white rounded-xl shadow-lg border-2 border-[#5B2600]/10">
                                <QRCode 
                                    value={getQRData()}
                                    size={160}
                                    level="H"
                                    fgColor="#5B2600"
                                    bgColor="#ffffff"
                                    includeMargin={true}
                                    marginSize={2}
                                />
                            </div>
                            <p className="mt-4 text-sm text-gray-600 text-center">
                                Scan QR code untuk melihat detail tiket
                            </p>
                            <div className="mt-2 text-xs text-[#5B2600]/60 font-medium">
                                ID: {ticketDetails.orderId}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-4">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="w-full px-6 py-3 bg-[#5B2600] text-white rounded-xl hover:bg-[#4A3427] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2"
                    >
                        <Ticket className="w-5 h-5" />
                        <span>Lihat Tiket Saya</span>
                    </button>

                    <button 
                        onClick={downloadReceipt} 
                        className="w-full px-6 py-3 bg-white text-[#5B2600] border-2 border-[#5B2600] rounded-xl hover:bg-[#5B2600] hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                <span>Download Receipt</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentComplete; 