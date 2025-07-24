'use client';

import { memo } from 'react';
import { ColDef } from 'ag-grid-community';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';

// Interface for the trade data structure
interface TradeData {
  bs_flag?: string;
  [key: string]: any;
}

/**
 * Custom cell renderer component for quantity display
 * Shows negative values in red and positive values in green
 * Based on the buy/sell flag ('B' or 'S')
 */
const QuantityCellRenderer = memo(({ value, data }: { value: any; data: TradeData }) => {
  // Handle null/undefined or non-numeric values
  if (value == null || isNaN(Number(value))) return '0';

  const bsFlag = data?.bs_flag?.toUpperCase();
  // Convert to negative if it's a sell order
  const signedQty = bsFlag === 'S' ? -Number(value) : Number(value);
  const isNegative = signedQty < 0;
  const colorClass = isNegative ? 'text-red-500' : 'text-green-500';

  return <div className={colorClass}>{signedQty}</div>;
});

// Column definitions for mobile view (simplified)
const mobileColumnDefs: ColDef[] = [
  { headerName: 'Trader ID', field: 'trdr_id' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Rate', field: 'rate' },
  {
    headerName: 'Quantity',
    field: 'qty',
    cellRenderer: QuantityCellRenderer,
  },
  { headerName: 'Time', field: 'time' },
  { headerName: 'Client ID', field: 'clnt_id' },
  { headerName: 'Order ID', field: 'ordr_id' },
  { headerName: 'Buy/Sell', field: 'bs_flag' },
  { headerName: 'Trade ID', field: 'trade_id' },
  { headerName: 'Order Time', field: 'ord_time' },
  { headerName: 'Trade Modified Time', field: 'trd_mod_time' }
];

// Column definitions for desktop view (detailed)
const desktopColumnDefs: ColDef[] = [
  { headerName: 'Member ID', field: 'membr_id' },
  { headerName: 'Trader ID', field: 'trdr_id' },
  { headerName: 'Script Code', field: 'scrp_code' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Rate', field: 'rate' },
  {
    headerName: 'Quantity',
    field: 'qty',
    cellRenderer: QuantityCellRenderer,
  },
  { headerName: 'Trade Status', field: 'trd_status' },
  { headerName: 'CM Code', field: 'cm_code' },
  { headerName: 'Time', field: 'time' },
  { headerName: 'Date', field: 'date' },
  { headerName: 'Client ID', field: 'clnt_id'},
  { headerName: 'Order ID', field: 'ordr_id' },
  { headerName: 'Transaction Type / Order Type', field: 'trns_type' },
  { headerName: 'Buy/Sell', field: 'bs_flag' },
  { headerName: 'Trade ID', field: 'trade_id' },
  { headerName: 'Client Type', field: 'clnt_type' },
  { headerName: 'ISIN', field: 'isin' },
  { headerName: 'Script Group', field: 'scrp_group' },
  { headerName: 'Settlement No.', field: 'sett_no' },
  { headerName: 'Order Time', field: 'ord_time' },
  { headerName: 'AO/PO Flag', field: 'ao_po_flag' },
  { headerName: 'Location ID', field: 'location_id' },
  { headerName: 'Trade Modified Time', field: 'trd_mod_time' },
  { headerName: 'Session ID or Trader ID', field: 'session_id' },
  { headerName: 'CP Code', field: 'cp_code' },
  { headerName: 'CP Code Confirmation', field: 'cp_code_confrn' },
  { headerName: 'Old Custodian Participant', field: 'old_cust_participant' },
  { headerName: 'Old Custodian Code', field: 'old_cust_code' }
];

// Page index reference for the trade grid
const pageIndex = { current: 0 };

/**
 * BSE Cash Market Page Component
 * Displays a grid of BSE cash market trades with responsive columns
 */
export default function BSECashMarketPage() {
  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid 
          mobColDef={mobileColumnDefs} 
          fileColDef={desktopColumnDefs} 
          requestType={'table'} 
          requestName='EQ_ITR' 
          pageIndex={pageIndex}
        />
      </div>
    </div>
  );
}