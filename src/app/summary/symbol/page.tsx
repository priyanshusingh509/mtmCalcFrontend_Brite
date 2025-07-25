'use client';
import Header from '../../components/header';
import TradeGrid from '../../components/TradeGrid';
import { ColDef } from 'ag-grid-community';
import { useState } from 'react';

const columnDefs: ColDef[] = [
  { headerName: 'Script Code', field: 'scrp_code' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Margin', field: 'margin' },
  { headerName: 'Net Qty', field: 'netQty' },
  { headerName: 'MTM', field: 'MTM' }
];

const pageIndex = { current: 0 };

// Symbol Summary Page Component
export default function symbolSummaryPage() {
  const [tableUsed, setTableUsed] = useState('BSE_Cash');
  
  return (
    <div className="h-screen flex flex-col">
      <Header />
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