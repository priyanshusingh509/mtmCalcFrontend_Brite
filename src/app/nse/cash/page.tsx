'use client';

import Header from '../../components/header';
import TradeGrid from '../../components/TradeGrid';
import { ColDef } from 'ag-grid-community';
import { memo } from 'react';

interface TradeData {
  buy_sell?: string;
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

  const bsFlag = data?.buy_sell?.toUpperCase();
  // Convert to negative if it's a sell order
  const signedQty = bsFlag === 'BUY' ? Number(value) : -Number(value);
  const isNegative = signedQty < 0;
  const colorClass = isNegative ? 'text-red-500' : 'text-green-500';

  return <div className={colorClass}>{signedQty}</div>;
});

// Column definitions for Desktop view (detailed)
const desktopColumnDefs: ColDef[] = [
  { headerName: "ID", field: "id" },
  { headerName: "Trade Number", field: "trade_number" },
  { headerName: "Trade Time", field: "tradeTime" },
  { headerName: "Buy/Sell", field: "buy_sell" },
  { headerName: "Symbol", field: "symbol" },
  { headerName: "Instrument Type", field: "inst_type" },
  { headerName: "Option Type", field: "opt_type" },
  { headerName: "Expiry", field: "expiry" },
  { headerName: "Strike Price", field: "strike_price" },  
  {
    headerName: "Trade Quantity",
    field: "trade_qty",
    cellRenderer: QuantityCellRenderer,
  },
  { headerName: "Trade Price", field: "trade_price" },
  { headerName: "CTCL ID", field: "ctcl_id" },
  { headerName: "Broker ID", field: "broker_id" },
  { headerName: "Strategy ID", field: "strategy_id" },
  { headerName: "Strategy Name", field: "strategy_name" },
  { headerName: "User ID", field: "user_id" },
  { headerName: "Token", field: "token" },
  { headerName: "Exchange", field: "exchange" },
  { headerName: "Segment", field: "segment" },
  { headerName: "Response Order Number", field: "response_order_number" },
  { headerName: "Settlor", field: "settlor" },
  { headerName: "Old Settlor", field: "old_settlor" },
  { headerName: "Account Number", field: "account_number" },
  { headerName: "Old Account Number", field: "old_account_number" },
  { headerName: "Original Volume", field: "original_vol" },
  { headerName: "Disclosed Volume", field: "disclosed_vol" },
  { headerName: "Remaining Volume", field: "remaining_vol" },
  { headerName: "Disclosed Volume Remaining", field: "disclosed_vol_remaining" },
  { headerName: "Order Price", field: "order_price" },
  { headerName: "GTD", field: "gtd" },
  { headerName: "Volume Filled Today", field: "vol_filled_today" },
  { headerName: "Activity Type", field: "activity_type" },
  { headerName: "OP Order Number", field: "op_order_number" },
  { headerName: "OP Broker ID", field: "op_broker_id" },
  { headerName: "Open/Close", field: "open_close" },
  { headerName: "Old Open/Close", field: "old_open_close" },
  { headerName: "Book Type", field: "book_type" },
  { headerName: "New Volume", field: "new_volume" },
  { headerName: "Give Up", field: "give_up" },
  { headerName: "PAN", field: "pan" },
  { headerName: "Old PAN", field: "old_pan" },
  { headerName: "Algo ID", field: "algo_id" },
  { headerName: "Algo Category", field: "algo_category" },
  { headerName: "Last Activity Reference", field: "last_activity_reference" },
  { headerName: "NNF", field: "nnf" }
];

// Page index state for pagination
const pageIndex = { current: 0 };

/**
 * NSE Cash Market Page Component
 * Displays cash market trading data for NSE (National Stock Exchange)
 */
export default function nseCashPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid
          mobColDef={desktopColumnDefs}
          fileColDef={desktopColumnDefs}
          requestType="table"
          requestName="NSE_Cash"
          pageIndex={pageIndex}
        />
      </div>
    </div>
  );
}