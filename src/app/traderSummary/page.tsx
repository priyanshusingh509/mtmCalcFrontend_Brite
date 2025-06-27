'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: 'Trader ID', field: 'trdr_id' },
  { headerName: 'Script Code', field: 'scrp_code' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: "Margin", field: "margin"},
  { headerName: "Net Qty", field: "netQty"},
  { headerName: "Net Position", field: "netPosition"},
  { headerName: "MTM", field: "MTM"},
];

const pageIndex = { current: 0 };

export default function bseCashMarketPage(){
    return(
      <div>
        <Header/>
        <div className="flex h-full flex-col w-full">
          <TradeGrid fileColDef={columnDefs} tableName='EQ_ITR' pageIndex={pageIndex} filter='trader'/>
        </div>
      </div>
    )
}