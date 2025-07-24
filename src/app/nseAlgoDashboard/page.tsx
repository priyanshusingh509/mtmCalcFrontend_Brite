'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

/**
 * Column definitions for the NSE Algo Dashboard
 * Displays aggregated algorithm trading data with summary statistics
 * Shows algorithm performance metrics and trade counts
 */
const columnDefs: ColDef[] = [
  { headerName: 'Algo Id', field: 'algo_id' },
  { headerName: 'Algo Category', field: 'algo_category' },
  { headerName: 'Segment', field: 'segment' },
  { headerName: 'Number of Trades', field: 'nTrades' }
];

// Page index state for pagination
const pageIndex = { current: 0 };

/**
 * NSE Algo Dashboard Page Component
 * Displays aggregated algorithmic trading data for NSE (National Stock Exchange)
 * Shows summary statistics and performance metrics for different algorithms
 * Uses aggregate request type to display summarized data by trader
 */
export default function turnoverPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Page header */}
      <Header />
      
      {/* Main content area with aggregated trade grid */}
      <div className="flex flex-col flex-grow">
        <TradeGrid
          mobColDef={columnDefs}
          fileColDef={columnDefs}
          requestType="aggregate"
          requestName="nseAlgo"
          pageIndex={pageIndex}
          summaryType="trader"
        />
      </div>
    </div>
  );
}