'use client';
import Header from '../../components/header';
import TradeGrid from '../../components/TradeGrid';
import { ColDef } from 'ag-grid-community';
import { useState } from 'react';

/**
 * Column definitions for the Symbol Summary data grid
 * Displays portfolio summary information by symbol including positions and P&L
 */
const columnDefs: ColDef[] = [
  { headerName: 'Script Code', field: 'scrp_code' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Margin', field: 'margin' },
  { headerName: 'Net Qty', field: 'netQty' },
  { headerName: 'MTM', field: 'MTM' }
];

// Page index state for pagination
const pageIndex = { current: 0 };

/**
 * Symbol Summary Page Component
 * Displays portfolio summary data grouped by symbol
 * Shows position information including margin, net quantity, and mark-to-market (MTM) values
 * Allows switching between different table types (default: EQ_ITR for equity intraday)
 */
export default function symbolSummaryPage() {
  // State to track which table/data source is currently being used
  const [tableUsed, setTableUsed] = useState('BSE_Cash');
  
  return (
    <div className="h-screen flex flex-col">
      {/* Page header */}
      <Header />
      
      {/* Main content area with symbol summary grid */}
      <div className="flex flex-col flex-grow">
        <TradeGrid
          mobColDef={columnDefs}
          fileColDef={columnDefs}
          requestName={tableUsed}
          requestType="table"
          pageIndex={pageIndex}
          summaryType="symbol"
          setTableUsed={setTableUsed}
        />
      </div>
    </div>
  );
}