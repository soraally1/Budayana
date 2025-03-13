# Budayana Payment Server

This is the payment server for Budayana, handling Midtrans payment integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Midtrans credentials:
- `MIDTRANS_SERVER_KEY`: Your Midtrans server key
- `MIDTRANS_CLIENT_KEY`: Your Midtrans client key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Development

Run the server in development mode:
```bash
npm run dev
```

## Production

1. Build the application:
```bash
npm install --production
```

2. Start the server:
```bash
npm start
```

## Deployment Options

### 1. Railway.app
1. Create a new project on Railway.app
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy!

### 2. Render.com
1. Create a new Web Service
2. Connect your GitHub repository
3. Add environment variables in Render dashboard
4. Deploy!

### 3. DigitalOcean App Platform
1. Create a new app
2. Connect your GitHub repository
3. Add environment variables in DigitalOcean dashboard
4. Deploy!

## Environment Variables

Required environment variables:
- `MIDTRANS_SERVER_KEY`: Your Midtrans server key
- `MIDTRANS_CLIENT_KEY`: Your Midtrans client key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## API Endpoints

- `POST /api/create-payment-token`: Create a new payment token
- `POST /api/payment-notification`: Handle payment notifications from Midtrans
- `GET /health-check`: Health check endpoint

## CORS Configuration

The server is configured to accept requests from:
- http://localhost:5173 (development)
- http://localhost:3000 (development)

Update the CORS configuration in `index.js` for production URLs. 