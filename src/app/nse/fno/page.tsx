'use client';

import Header from '../../components/header';
import TradeGrid from '../../components/TradeGrid';
import { ColDef } from 'ag-grid-community';
import { memo } from 'react';

interface TradeData {
  buy_sell?: number;
  [key: string]: any;
}

/**
 * Custom cell renderer component for quantity display
 * Shows negative values in red and positive values in green
 * Based on the buy/sell flag ('BUY' or 'SELL')
 */
const QuantityCellRenderer = memo(({ value, data }: { value: any; data: TradeData }) => {
  // Handle null/undefined or non-numeric values
  if (value == null || isNaN(Number(value))) return '0';

  const bsFlag = data?.buy_sell;
  // Convert to negative if it's a sell order
  const signedQty = bsFlag === 1 ? Number(value) : -Number(value);
  const isNegative = signedQty < 0;
  const colorClass = isNegative ? 'text-red-500' : 'text-green-500';

  return <div className={colorClass}>{signedQty}</div>;
});

const BuySellCellRenderer = memo(({ value }: { value: any }) => {
  if (value === 1) {
    return <div className="text-green-500">BUY</div>;
  } else if (value === 2) {
    return <div className="text-red-500">SELL</div>;
  }
  return <div>{value}</div>;
});

// Column definitions for desktop view (detailed)
const desktopColumnDefs: ColDef[] = [
  { headerName: "Trade Number", field: "trade_number" },
  { headerName: "Symbol", field: "symbol" },
  { headerName: "Instrument Type", field: "instrument" },
  { headerName: "Expiry", field: "expiry" },
  { headerName: "Strike Price", field: "strike_price" },
  { headerName: "Option Type", field: "option_type" },
  { headerName: "Script", field: "script" },
  { headerName: "Member Id", field: "member_id" },
  { headerName: "Buy/Sell", field: "buy_sell", cellRenderer: BuySellCellRenderer },
  { headerName: "Quantity", 
    field: "qty",
    cellRenderer: QuantityCellRenderer,
  },
  { headerName: "Price", field: "price" },
  { headerName: "Pro/Client", field: "pro_client" },
  { headerName: "Client Id", field: "client_id" },
  { headerName: "Timestamp 1", field: "ts1" },
  { headerName: "Timestamp 2", field: "ts2" },
  { headerName: "Timestamp 3", field: "ts3" },
  { headerName: "CTCL NO", field: "ctcl_no" },
  { headerName: "Code", field: "code" },
  
];

// Column definitions for mobile view (simplified)
const mobileColumnDefs: ColDef[] = [
  { headerName: "Trade Number", field: "trade_number" },
  { headerName: "Symbol", field: "symbol" },
  { headerName: "Instrument Type", field: "instrument" },
  { headerName: "Expiry", field: "expiry" },
  { headerName: "Strike Price", field: "strike_price" },
  { headerName: "Option Type", field: "option_type" },
  { headerName: "Script", field: "script" },
  { headerName: "Member Id", field: "member_id" },
  { headerName: "Buy/Sell", field: "buy_sell", cellRenderer: BuySellCellRenderer },
  { headerName: "Quantity", 
    field: "qty",
    cellRenderer: QuantityCellRenderer,
  },
  { headerName: "Price", field: "price" },
  { headerName: "Pro/Client", field: "pro_client" },
  { headerName: "Client Id", field: "client_id" },
  { headerName: "Timestamp 1", field: "ts1" },
  { headerName: "Timestamp 2", field: "ts2" },
  { headerName: "Timestamp 3", field: "ts3" },
  { headerName: "CTCL NO", field: "ctcl_no" },
  { headerName: "Code", field: "code" },
];

// Page index state for pagination
const pageIndex = { current: 0 };

/**
 * NSE F&O Page Component
 * Displays trading data for NSE Futures & Options
*/
export default function nseFnoPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid
          mobColDef={mobileColumnDefs}
          fileColDef={desktopColumnDefs}
          requestType="table"
          requestName="NSE_FNO"
          pageIndex={pageIndex}
        />
      </div>
    </div>
  );
}