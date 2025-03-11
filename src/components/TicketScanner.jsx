import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  User,
  ArrowLeft,
  Camera,
  RefreshCw,
  AlertCircle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Shield,
  AlertTriangle,
  Info,
} from "lucide-react";

const TicketScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [cameraError, setCameraError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const scannerRef = useRef(null);
  const lastScanTime = useRef(0);
  const successSound = useRef(new Audio('/sounds/success.mp3'));
  const errorSound = useRef(new Audio('/sounds/error.mp3'));
  const navigate = useNavigate();

  // Get available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setDevices(devices);
          // Prefer back camera if available
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment')
          );
          setSelectedDevice(backCamera || devices[0]);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        setCameraError("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.");
      });
  }, []);

  // Initialize QR Scanner with improved configuration
  useEffect(() => {
    if (scanning && !scannerRef.current && selectedDevice) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 15, // Increased FPS for smoother scanning
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE
          ],
          rememberLastUsedCamera: true,
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Only log the error, don't show it to the user
          console.error("QR Scanner error:", errorMessage);
          setScanAttempts(prev => prev + 1);
        }
      );

      scannerRef.current = scanner;
      setCameraReady(true);
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      setCameraReady(false);
      setScanning(true);
    };
  }, [scanning, selectedDevice]);

  const handleScan = async (data) => {
    if (!data) return;

    // Prevent rapid-fire scanning
    const now = Date.now();
    if (now - lastScanTime.current < 1000) { // 1 second cooldown
      return;
    }
    lastScanTime.current = now;

    setScanning(false);
    setLoading(true);
    setError(null);
    setTicketData(null);
    setCheckInStatus(null);

    try {
      // Parse the QR code data
      let ticketId;
      try {
        const qrData = JSON.parse(data);
        if (!qrData.ticketId) {
          throw new Error('Invalid QR code format: missing ticketId');
        }
        ticketId = qrData.ticketId;
      } catch (parseError) {
        console.error('Error parsing QR data:', parseError);
        // If parsing fails, try to use the data directly as ticket ID
        ticketId = data;
      }

      if (!ticketId) {
        setError("Format QR code tidak valid");
        setLoading(false);
        if (isSoundEnabled) errorSound.current.play();
        return;
      }

      // Get ticket data from Firestore
      const ticketRef = doc(db, "tickets", ticketId);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setError("Tiket tidak ditemukan");
        setLoading(false);
        if (isSoundEnabled) errorSound.current.play();
        return;
      }

      const ticket = ticketSnap.data();
      
      // Get event data
      const eventRef = doc(db, "events", ticket.eventId);
      const eventSnap = await getDoc(eventRef);
      const eventData = eventSnap.data();

      // Get user data
      const userRef = doc(db, "users", ticket.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Check if ticket is already used
      if (ticket.used) {
        setCheckInStatus("used");
        setTicketData({ 
          ...ticket, 
          event: eventData,
          userName: userData?.name || ticket.userName || 'Unknown User'
        });
        setLoading(false);
        if (isSoundEnabled) errorSound.current.play();
        return;
      }

      // Check if ticket is for today's event
      const today = new Date().toISOString().split('T')[0];
      const eventDate = eventData.date;
      
      // Convert dates to timestamps for comparison
      const todayTimestamp = new Date(today).getTime();
      const eventDateTimestamp = new Date(eventDate).getTime();
      
      if (eventDateTimestamp < todayTimestamp) {
        setCheckInStatus("wrong_date");
        setTicketData({ 
          ...ticket, 
          event: eventData,
          userName: userData?.name || ticket.userName || 'Unknown User'
        });
        setLoading(false);
        if (isSoundEnabled) errorSound.current.play();
        return;
      }

      // If event is today or in the future, allow check-in
      setTicketData({ 
        ...ticket, 
        event: eventData,
        userName: userData?.name || ticket.userName || 'Unknown User'
      });
      setCheckInStatus("valid");
      setLoading(false);
      if (isSoundEnabled) successSound.current.play();

      // Add to scan history
      setScanHistory(prev => [{
        id: ticketId,
        timestamp: new Date().toISOString(),
        status: 'valid',
        eventName: eventData.name,
        userName: userData?.name || ticket.userName || 'Unknown User'
      }, ...prev].slice(0, 10)); // Keep last 10 scans
    } catch (error) {
      console.error("Error scanning ticket:", error);
      setError("Terjadi kesalahan saat memindai tiket");
      setLoading(false);
      if (isSoundEnabled) errorSound.current.play();
    }
  };

  const handleCheckIn = async () => {
    if (!ticketData) return;

    setLoading(true);
    try {
      // Update ticket status in Firestore
      const ticketRef = doc(db, "tickets", ticketData.id);
      await updateDoc(ticketRef, {
        used: true,
        checkInTime: new Date().toISOString(),
      });

      // Update event's ticketsSold count
      const eventRef = doc(db, "events", ticketData.eventId);
      await updateDoc(eventRef, {
        ticketsSold: (ticketData.event.ticketsSold || 0) + 1,
      });

      setCheckInStatus("checked_in");
      setLoading(false);
      if (isSoundEnabled) successSound.current.play();

      // Add to scan history
      setScanHistory(prev => [{
        id: ticketData.id,
        timestamp: new Date().toISOString(),
        status: 'checked_in',
        eventName: ticketData.event.name,
        userName: ticketData.userName
      }, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Error checking in ticket:", error);
      setError("Terjadi kesalahan saat melakukan check-in");
      setLoading(false);
      if (isSoundEnabled) errorSound.current.play();
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setTicketData(null);
    setError(null);
    setCheckInStatus(null);
    setScanAttempts(0);
    setCameraError(null);
  };

  const switchCamera = (deviceId) => {
    setSelectedDevice(devices.find(d => d.id === deviceId));
    setScanning(false);
    setTimeout(() => setScanning(true), 100);
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'text-green-500';
      case 'used':
        return 'text-red-500';
      case 'wrong_date':
        return 'text-amber-500';
      case 'checked_in':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'used':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'wrong_date':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'checked_in':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#5B2600]" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-fuzzy font-bold text-[#5B2600]">
              Scan Tiket
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <Shield className="w-6 h-6 text-[#5B2600]" />
            </button>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="aspect-square max-w-md mx-auto relative overflow-hidden rounded-xl">
            {scanning ? (
              <div className="relative w-full h-full">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                    <Camera className="w-16 h-16 text-red-500 mb-4" />
                    <p className="text-red-600 text-center px-4">{cameraError}</p>
                    <button
                      onClick={resetScanner}
                      className="mt-4 px-4 py-2 bg-[#5B2600] text-white rounded-lg hover:bg-[#4A3427] transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <>
                    <div id="reader" className="w-full h-full" />
                    {!cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <Loader2 className="w-8 h-8 animate-spin text-[#5B2600]" />
                      </div>
                    )}
                    {scanAttempts > 0 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Mencoba scan: {scanAttempts}
                      </div>
                    )}
                    {/* Camera Controls */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {devices.length > 1 && (
                        <select
                          value={selectedDevice?.id || ''}
                          onChange={(e) => switchCamera(e.target.value)}
                          className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2600]"
                        >
                          {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                              {device.label || `Camera ${device.id}`}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={toggleSound}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                      >
                        {isSoundEnabled ? (
                          <Volume2 className="w-5 h-5 text-[#5B2600]" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-[#5B2600]" />
                        )}
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-5 h-5 text-[#5B2600]" />
                        ) : (
                          <Maximize2 className="w-5 h-5 text-[#5B2600]" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-[#5B2600] text-white rounded-lg hover:bg-[#4A3427] transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Scan Ulang
                </button>
              </div>
            )}
          </div>

          {/* Scanning Tips */}
          <div className="mt-4 space-y-2">
            <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              Pastikan QR code berada dalam bingkai dan terlihat jelas
            </p>
            <p className="text-center text-xs text-gray-500">
              Tekan tombol kamera untuk beralih antara kamera depan dan belakang
            </p>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {(loading || ticketData || error) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#5B2600]" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-lg text-red-600">{error}</p>
                </div>
              ) : ticketData && (
                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-center">
                    {getStatusIcon(checkInStatus)}
                  </div>

                  {/* Status Message */}
                  <div className="text-center">
                    <h3 className="text-xl font-fuzzy font-bold text-[#5B2600] mb-2">
                      {checkInStatus === "valid"
                        ? "Tiket Valid"
                        : checkInStatus === "used"
                        ? "Tiket Sudah Digunakan"
                        : checkInStatus === "wrong_date"
                        ? "Event Sudah Berakhir"
                        : "Check-in Berhasil"}
                    </h3>
                    <p className="text-[#8B4513]/80">
                      {checkInStatus === "valid"
                        ? "Tiket dapat digunakan untuk check-in"
                        : checkInStatus === "used"
                        ? "Tiket ini sudah digunakan sebelumnya"
                        : checkInStatus === "wrong_date"
                        ? "Tiket ini untuk event yang sudah berakhir"
                        : "Tiket berhasil di-check-in"}
                    </p>
                  </div>

                  {/* Ticket Details */}
                  <div className="border-t border-[#E8DED5] pt-6">
                    <h4 className="text-lg font-fuzzy font-bold text-[#5B2600] mb-4">
                      Detail Tiket
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Ticket className="w-5 h-5 text-[#8B4513]" />
                        <span className="text-[#5B2600]">
                          {ticketData.event.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#8B4513]" />
                        <span className="text-[#5B2600]">
                          {ticketData.event.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#8B4513]" />
                        <span className="text-[#5B2600]">
                          {ticketData.event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#8B4513]" />
                        <span className="text-[#5B2600]">
                          {ticketData.event.venue}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-[#8B4513]" />
                        <span className="text-[#5B2600]">
                          {ticketData.userName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Check-in Button */}
                  {checkInStatus === "valid" && (
                    <div className="pt-6">
                      <button
                        onClick={handleCheckIn}
                        disabled={loading}
                        className="w-full py-3 bg-[#5B2600] text-white rounded-xl font-medium hover:bg-[#4A3427] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          "Check-in Tiket"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-fuzzy font-bold text-[#5B2600] mb-4">
                Riwayat Scan
              </h3>
              <div className="space-y-3">
                {scanHistory.length > 0 ? (
                  scanHistory.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(scan.status)}
                        <div>
                          <p className="font-medium text-[#5B2600]">{scan.eventName}</p>
                          <p className="text-sm text-gray-600">{scan.userName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(scan.status)}`}>
                          {scan.status === 'valid' ? 'Valid' :
                           scan.status === 'used' ? 'Used' :
                           scan.status === 'wrong_date' ? 'Wrong Date' :
                           'Checked In'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada riwayat scan
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TicketScanner; 