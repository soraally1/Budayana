/* eslint-env node */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import midtransClient from 'midtrans-client';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MIDTRANS_SERVER_KEY', 'MIDTRANS_CLIENT_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} is not set in environment variables`);
        process.exit(1);
    }
}

const app = express();

// Enable CORS with specific configuration
app.use(cors({
    origin: ['https://budayana.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
    credentials: false,
    optionsSuccessStatus: 204,
    preflightContinue: false
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

app.use(express.json());

// Initialize Midtrans
let snap;
try {
    snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
    });
    console.log('Midtrans initialized successfully');
} catch (error) {
    console.error('Error initializing Midtrans:', error);
    process.exit(1);
}

// Basic root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Payment server is running' });
});

// Health check endpoint
app.get('/health-check', (req, res) => {
    try {
        if (!snap) {
            throw new Error('Midtrans not initialized');
        }
        res.json({ 
            status: 'healthy', 
            message: 'Server is running',
            midtrans: 'initialized',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'unhealthy', 
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Create payment token endpoint
app.post('/api/create-payment-token', async (req, res) => {
    try {
        const {
            orderId,
            amount,
            customerName,
            customerEmail,
            customerPhone,
            itemDetails
        } = req.body;

        console.log('Received payment request:', {
            orderId,
            amount,
            customerName,
            customerEmail,
            customerPhone,
            itemDetails
        });

        // Validate required fields
        if (!orderId || !amount || !customerName || !customerEmail || !customerPhone || !itemDetails) {
            console.error('Missing required fields:', {
                orderId: !!orderId,
                amount: !!amount,
                customerName: !!customerName,
                customerEmail: !!customerEmail,
                customerPhone: !!customerPhone,
                itemDetails: !!itemDetails
            });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            console.error('Invalid email format:', customerEmail);
            return res.status(400).json({
                success: false,
                message: 'Invalid email format. Please provide a valid email address.'
            });
        }

        // Format phone number (remove any non-digit characters)
        const formattedPhone = customerPhone.replace(/\D/g, '');

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: parseInt(amount)
            },
            customer_details: {
                first_name: customerName,
                email: customerEmail.toLowerCase().trim(), // Normalize email
                phone: formattedPhone
            },
            item_details: itemDetails.map(item => ({
                ...item,
                price: parseInt(item.price)
            }))
        };

        console.log('Creating payment with parameters:', JSON.stringify(parameter, null, 2));

        const transaction = await snap.createTransaction(parameter);
        console.log('Raw Midtrans response:', JSON.stringify(transaction, null, 2));

        if (!transaction) {
            console.error('No response from Midtrans');
            throw new Error('No response from Midtrans');
        }

        // Prepare response data
        const responseData = {
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            transaction_id: transaction.transaction_id,
            order_id: transaction.order_id,
            payment_type: transaction.payment_type,
            status_code: transaction.status_code,
            status_message: transaction.status_message
        };

        console.log('Prepared response data:', JSON.stringify(responseData, null, 2));

        // Validate the response data
        if (!responseData.token && !responseData.redirect_url) {
            console.error('Missing both token and redirect_url in response:', responseData);
            throw new Error('Invalid Midtrans response: missing both token and redirect_url');
        }

        // Return the transaction data
        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Payment token creation error:', error);
        
        // Handle specific Midtrans errors
        if (error.message.includes('401')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Midtrans credentials. Please check your server key and client key.'
            });
        }

        // Handle validation errors
        if (error.message.includes('customer_details')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer details. Please check your input and try again.',
                details: error.message
            });
        }

        // Log the full error for debugging
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response
        });

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment token',
            details: error.response ? error.response.data : null
        });
    }
});

// Payment notification endpoint
app.post('/api/payment-notification', async (req, res) => {
    try {
        const notification = await snap.transaction.notification(req.body);
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log('Transaction status:', transactionStatus);
        console.log('Fraud status:', fraudStatus);

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                // Handle challenge transaction
                res.status(200).json({ message: 'Payment pending' });
            } else if (fraudStatus === 'accept') {
                // Handle successful transaction
                res.status(200).json({ message: 'Payment successful' });
            }
        } else if (transactionStatus === 'settlement') {
            // Handle settlement transaction
            res.status(200).json({ message: 'Payment settled' });
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            // Handle failed transaction
            res.status(200).json({ message: 'Payment failed' });
        } else if (transactionStatus === 'pending') {
            // Handle pending transaction
            res.status(200).json({ message: 'Payment pending' });
        }
    } catch (error) {
        console.error('Payment notification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`,
        timestamp: new Date().toISOString()
    });
});

// Export the Express app for Vercel
export default app;

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('Environment:', process.env.NODE_ENV || 'development');
        console.log('CORS enabled for:', ['https://budayana.netlify.app','http://localhost:5173', 'http://localhost:3000']);
        console.log('Server ready to accept requests');
    });
}