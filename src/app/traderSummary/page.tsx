'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: 'Trader ID', field: 'trdr_id'},
  { headerName: 'Script Code', field: 'scrp_code'},
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: "Net Qty", field: "netQty"},
  { headerName: "Realised PnL", field: "realisedPnL"},
  { headerName: "Unrealised PnL", field: "unrealisedPnL"},
  { headerName: "MTM", field: "MTM"},
];

const pageIndex = { current: 0 };

export default function bseCashMarketPage(){
    return(
      <div className='h-screen flex flex-col'>
        <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid fileColDef={columnDefs} tableName='EQ_ITR' pageIndex={pageIndex} summaryType='trader'/>
        </div>
      </div>
    )
}