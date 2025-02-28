/* eslint-env node */
import express from 'express';
import cors from 'cors';
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';

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

// CORS configuration
const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

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

// Generate payment token endpoint
app.post('/generate-token', async (req, res) => {
    try {
        console.log('Received payment request:', JSON.stringify(req.body, null, 2));
        const { orderId, amount, items, customerDetails } = req.body;

        // Validate required fields
        if (!orderId || !amount || !items || !customerDetails) {
            console.error('Missing required fields:', { orderId, amount, items, customerDetails });
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'orderId, amount, items, and customerDetails are required'
            });
        }

        // Validate amount
        if (typeof amount !== 'number' || amount <= 0) {
            console.error('Invalid amount:', amount);
            return res.status(400).json({
                error: 'Invalid amount',
                message: 'Amount must be a positive number'
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            console.error('Invalid items:', items);
            return res.status(400).json({
                error: 'Invalid items',
                message: 'Items must be a non-empty array'
            });
        }

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            customer_details: customerDetails,
            item_details: items.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.quantity,
                name: item.name
            }))
        };

        console.log('Creating Midtrans transaction with parameters:', JSON.stringify(parameter, null, 2));
        const transaction = await snap.createTransaction(parameter);
        
        if (!transaction || !transaction.token) {
            console.error('Failed to generate token:', transaction);
            throw new Error('Failed to generate payment token');
        }

        console.log('Payment token generated successfully');
        res.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({
            error: 'Payment token generation failed',
            message: error.message || 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, _next) => {
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('CORS enabled for:', ['http://localhost:5173', 'http://localhost:3000']);
    console.log('Server ready to accept requests');
}); 