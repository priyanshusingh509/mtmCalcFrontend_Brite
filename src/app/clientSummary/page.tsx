'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';
import { useState } from 'react';
const columnDefs: ColDef[] = [
  { headerName: 'Client ID', field: 'clnt_id'},
  { headerName: 'Script Code', field: 'scrp_code'},
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: "Net Qty", field: "netQty"},
  { headerName: "Realised PnL", field: "realisedPnL"},
  { headerName: "Unrealised PnL", field: "unrealisedPnL"},
  { headerName: "MTM", field: "MTM"},
];

const pageIndex = { current: 0 };

export default function clientSummaryPage(){
  const [tableUsed, setTableUsed] = useState('EQ_ITR');
  return(
      <div className='h-screen flex flex-col'>
        <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={columnDefs} fileColDef={columnDefs} requestName={tableUsed} requestType={'table'} pageIndex={pageIndex} summaryType='trader' setTableUsed={setTableUsed}/>
        </div>
      </div>
    )
}