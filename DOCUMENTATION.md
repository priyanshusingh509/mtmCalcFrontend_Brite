# AlgoQuant Dashboard - Documentation

## Overview
AlgoQuant Dashboard is a comprehensive trading and portfolio management application built with Next.js, React, and TypeScript. It provides real-time monitoring and management of trading activities across multiple markets including NSE, BSE, and MCX.

## Core Features

### 1. Authentication System
- User login and registration
- Session management
- Protected routes

### 2. Dashboard
- Real-time overview of trading metrics
- Summary of client positions and margins
- Performance analytics

### 3. Market Coverage
- **NSE (National Stock Exchange)**
  - Cash Market
  - F&O (Futures & Options)
  - Algorithmic Trading
- **BSE (Bombay Stock Exchange)**
  - Cash Market
  - Equity Derivatives
- **MCX (Multi Commodity Exchange)**
  - Commodity Trading
  - Margin Analysis

### 4. Key Functionalities

#### a. Client Management
- Client portfolio tracking
- Fund management
- Position monitoring

#### b. Margin Analysis
- Real-time margin calculations
  - FO (Futures & Options) Margin
  - MCX Margin
  - Cash Margin
  - Combined Margin
- Exposure monitoring

#### c. Risk Management
- MTM (Mark-to-Market) tracking
- Peak margin monitoring
- Exposure limits

### 5. Technical Stack

#### Frontend
- **Framework**: Next.js 13+ (App Router)
- **UI**: Headless UI components
- **State Management**: React Context API
- **Data Grid**: AG-Grid Enterprise
- **Styling**: Tailwind CSS
- **Type Checking**: TypeScript

#### Key Dependencies
- `@tanstack/react-table` - For data tables
- `axios` - HTTP client
- `oboe` - For streaming JSON data
- `react-error-boundary` - Error handling

### 6. Project Structure
```
src/
├── app/
│   ├── bseCashMarket/      # BSE Cash Market views
│   ├── bseEQD/             # BSE Equity Derivatives
│   ├── clientSummary/      # Client portfolio summaries
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── dashboard/          # Main dashboard
│   ├── mcxTrades/          # MCX trading views
│   ├── nseAlgoDashboard/   # NSE Algo trading dashboard
│   ├── nseCashMarket/      # NSE Cash Market views
│   ├── nseFnoAlgo/         # NSE F&O Algo trading
│   ├── symbolSummary/      # Symbol-wise trade summaries
│   └── turnover/           # Turnover reports
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

### 7. Key Components

#### TradeGrid
- Displays trade data in an interactive grid
- Supports sorting, filtering, and grouping
- Real-time data updates

#### Header
- Navigation component
- User session controls
- Quick access to different market sections

### 8. Data Management
- Real-time data streaming using WebSockets
- REST API integration for data fetching
- Client-side state management

### 9. Security
- Secure authentication flow
- Protected API routes
- Environment variable management

### 10. Development Setup

#### Prerequisites
- Node.js (v18+)
- npm or yarn
- Redis (for session management)

#### Installation
```bash
npm install
```

#### Running the Development Server
```bash
npm run dev
```

#### Building for Production
```bash
npm run build
npm start
```

## Usage

1. **Login** - Access the application using your credentials
2. **Dashboard** - View an overview of your trading activities
3. **Market Sections** - Navigate to specific market views
4. **Client Management** - Monitor and manage client portfolios
5. **Risk Analysis** - Track margins and exposures

## Environment Variables

The application requires the following environment variables:
- `NEXT_PUBLIC_BACKEND_IP` - Backend API endpoint
- (Other variables as specified in `.env.example`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
