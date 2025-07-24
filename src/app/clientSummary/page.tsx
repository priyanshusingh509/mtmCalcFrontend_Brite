'use client';

// Component imports
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';

// Type imports
import { ColDef } from 'ag-grid-community';
import { useState } from 'react';

/**
 * Column definitions for the client summary table.
 * Defines the structure and display of each column in the data grid.
 */
const columnDefs: ColDef[] = [
  { headerName: 'Client ID', field: 'clnt_id' },
  { headerName: 'Script Code', field: 'scrp_code' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Net Qty', field: 'netQty' },
  { headerName: 'Realised PnL', field: 'realisedPnL' },
  { headerName: 'Unrealised PnL', field: 'unrealisedPnL' },
  { headerName: 'MTM', field: 'MTM' },
];

// Track the current page index for pagination
const pageIndex = { current: 0 };

/**
 * Client Summary Page Component
 * Displays a summary of client trading data including positions and PnL information.
 * Uses a responsive grid layout that works on both desktop and mobile views.
 */
export default function ClientSummaryPage() {
  // State to track which table view is currently active
  const [tableUsed, setTableUsed] = useState('EQ_ITR');
  
  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid 
          mobColDef={columnDefs} 
          fileColDef={columnDefs} 
          requestName={tableUsed} 
          requestType={'table'} 
          pageIndex={pageIndex} 
          summaryType='trader' 
          setTableUsed={setTableUsed} 
        />
      </div>
    </div>
  );
}