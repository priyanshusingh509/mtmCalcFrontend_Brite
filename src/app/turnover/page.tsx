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
    headerName: 'BSE CM', 
    field: 'bseCmTurnover',
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
    }
  },
  { 
    headerName: 'BSE Futures', 
    field: 'bseFuturesTurnover',
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
    }
  },
  { 
    headerName: 'BSE Options', 
    field: 'bseOptionsTurnover',
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
    } 
  },
  { 
    headerName: "NSE CM", 
    field: "nseCmTurnover",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
    }
  },
  { 
    headerName: "NSE Futures", 
    field: "nseFuturesTurnover",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
    }
  },
  { 
    headerName: "NSE Options", 
    field: "nseOptionsTurnover",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
    }
  },
  { 
    headerName: "MCX", 
    field: "mcxTurnover",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
    }
  },
  { 
    headerName: "Net Turnover", 
    field: "total",
    valueFormatter: (params) => {
      if (params.value == null || isNaN(params.value)) return '0';
      return (params.value / divFactor).toFixed(2); 
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