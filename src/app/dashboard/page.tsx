'use client';

import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';
import { memo } from 'react';

/**
 * Custom cell renderer component for value display
 * Shows negative values in red and positive values in green
 */
const ValueCellRenderer = memo(
  ({ value }: { value: any }) => {
    if (value == null || isNaN(Number(value)) || value === '') {
      return '';
    }

    const num = Number(value);
    const isNegative = num < 0;

    const isZero = Number(value) === 0;
    const colorClass = isNegative ? 'text-red-500' :(isZero ? '' : 'text-green-500');

    const formattedValue = num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <div className={colorClass}>
        {formattedValue}
      </div>
    );
  }
);


const twoDecimalFormatter = (params: any) =>
  params.value != null ? params.value.toFixed(2) : '';
const columnDefs: ColDef[] = [
  { headerName: 'Code', field: 'code' },
  { headerName: "Symbol", field: "symbol" },
  { headerName: "Expiry", field: "expiry" },
  { headerName: "Strike Price", field: "strike_price" },
  { headerName: "Option Type", field: "option_type" },
  { headerName: "Buy Qty", field: "buy_qty" },
  { headerName: "Buy Avg", field: "buy_avg" , valueFormatter: twoDecimalFormatter,},
  { headerName: "Sell Qty", field: "sell_qty" },
  { headerName: "Sell Avg", field: "sell_avg", valueFormatter: twoDecimalFormatter, },
  { 
    headerName: "Net Qty", 
    field: "net_qty",
    colId: "net_qty",
    cellRenderer: ValueCellRenderer,
  },
  { 
    headerName: "Realised PnL", 
    field: "realised_pnl",
    colId: "realised_pnl",
    valueGetter: (params) => {
      const{buy_qty=0, buy_avg=0, sell_qty=0, sell_avg=0} = params.data;
      const realised_pnl = Math.min(buy_qty, sell_qty) * (sell_avg - buy_avg);
      return realised_pnl;
    },
    cellRenderer: ValueCellRenderer 
  },
  { 
    headerName: "LTP FUT", 
    field: "ltp_fut",
    colId: "ltp_fut",
    valueGetter: (params) => {
      const { ltp=0 } = params.data;
      if (ltp === 0) return 25175.4;
      return ltp;
    },
    valueFormatter: twoDecimalFormatter,
  },
  { 
    headerName: "Theoretical Market Value", 
    colId: "tmv",
    valueGetter: (params) => {
      const {strike_price=0, option_type=''} = params.data;
      const ltp_fut = params.getValue('ltp_fut') as number;
      if (strike_price < ltp_fut){
        if (option_type === 'CE') return (ltp_fut - strike_price);
        return 0;
      }
      else {
        if (option_type === 'PE') return (strike_price - ltp_fut);
        return 0;
      }
    },
    valueFormatter: twoDecimalFormatter,
  },
  { 
    headerName: "Unrealised PnL", 
    field: "unrealised_pnl", 
    valueGetter: (params) => {
      const { net_qty=0, buy_avg=0, sell_avg=0 } = params.data;
      const tmv = params.getValue('tmv') ?? 0;
      if (net_qty > 0) return (tmv - buy_avg) * net_qty;
      return (sell_avg - tmv) * Math.abs(net_qty);
    },
    cellRenderer: ValueCellRenderer 
  },
  { 
    headerName: "MTM", 
    field: "mtm",
    colId: "mtm",
    valueGetter: (params) => {
      const realisedPnl = params.getValue('realised_pnl') ?? 0;
      const unrealisedPnl = params.getValue('unrealised_pnl') ?? 0;
      return realisedPnl + unrealisedPnl;
    },
    cellRenderer: ValueCellRenderer 
  },
  
];

// Track the current page index for pagination
const pageIndex = { current: 0 };

/**
 * Dashboard Page Component
 * Displays a comprehensive overview of client trading metrics including:
 * - Fund details
 * - Margin information (FO, MCX, Combined)
 * - MTM (Mark-to-Market) calculations
 * - Peak margin details
 */
export default function DashboardPage() {
  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid 
          mobColDef={columnDefs} 
          fileColDef={columnDefs} 
          requestType={'aggregate'} 
          requestName='dashboard' 
          pageIndex={pageIndex}
        />
      </div>
    </div>
  );
}