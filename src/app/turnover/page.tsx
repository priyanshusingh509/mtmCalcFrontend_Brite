'use client';
import { useState } from 'react';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const pageIndex = { current: 0 };

export default function turnoverPage(){
  const [divFactor, setDivFactor] = useState(10000000);
  const columnDefs: ColDef[] = [
  { 
    headerName: 'Client Code', 
    field: 'clientCode'
  },
  { 
    headerName: 'BSE CM Turnover', 
    field: 'bseCmTurnover',
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); // 1 Cr = 10,000,000
    }
  },
  { 
    headerName: 'BSE Futures Turnover', 
    field: 'bseFuturesTurnover',
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); // 1 Cr = 10,000,000
    }
  },
  { 
    headerName: 'BSE Options Turnover', 
    field: 'bseOptionsTurnover',
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); // 1 Cr = 10,000,000
    } 
  },
  { 
    headerName: "NSE CM Turnover", 
    field: "nseCmTurnover",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); // 1 Cr = 10,000,000
    }
  },
  { 
    headerName: "NSE Futures Turnover", 
    field: "nseFuturesTurnover",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); // 1 Cr = 10,000,000
    }
  },
  { 
    headerName: "NSE Options Turnover", 
    field: "nseOptionsTurnover",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); // 1 Cr = 10,000,000
    }
  },
  { 
    headerName: "Net Turnover", 
    field: "total",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); // 1 Cr = 10,000,000
    }
  }
];
  return(
      <div className='h-screen flex flex-col'>
        <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={columnDefs} fileColDef={columnDefs} requestType={'aggregate'} requestName='turnover' pageIndex={pageIndex} divFactor={divFactor} setDivFactor={setDivFactor}/>
        </div>
      </div>
    )
}