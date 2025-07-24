'use client';
import { useState } from 'react';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

// This component displays turnover data grouped by client and market segment.
// It allows users to view turnover figures for various exchanges like BSE, NSE, and MCX.
export default function TurnoverPage() {
  // State for managing the divisor factor for turnover values (e.g., to display in crores).
  const [divFactor, setDivFactor] = useState(10000000);

  // Defines a constant for the page index.
  const pageIndex = { current: 0 };

  // Column definitions for the turnover data grid.
  const columnDefs: ColDef[] = [
    {
      headerName: 'Client Code',
      field: 'clientCode',
    },
    {
      headerName: 'BSE CM',
      field: 'bseCmTurnover',
      // Formats the turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
    {
      headerName: 'BSE Futures',
      field: 'bseFuturesTurnover',
      // Formats the turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
    {
      headerName: 'BSE Options',
      field: 'bseOptionsTurnover',
      // Formats the turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
    {
      headerName: 'NSE CM',
      field: 'nseCmTurnover',
      // Formats the turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
    {
      headerName: 'NSE Futures',
      field: 'nseFuturesTurnover',
      // Formats the turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
    {
      headerName: 'NSE Options',
      field: 'nseOptionsTurnover',
      // Formats the turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
    {
      headerName: 'MCX',
      field: 'mcxTurnover',
      // Formats the turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
    {
      headerName: 'Net Turnover',
      field: 'total',
      // Formats the total turnover value by dividing it by the divFactor.
      valueFormatter: (params) => {
        if (params.value == null || isNaN(params.value)) return '0';
        return (params.value / divFactor).toFixed(2);
      },
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid
          mobColDef={columnDefs}
          fileColDef={columnDefs}
          requestType={'aggregate'}
          requestName="turnover"
          pageIndex={pageIndex}
          divFactor={divFactor}
          setDivFactor={setDivFactor}
        />
      </div>
    </div>
  );
}