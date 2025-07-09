'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: 'Script Code', field: 'scrp_code'},
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: "Margin", field: "margin"},
  { headerName: "Net Position", field: "netPosition"},
  { headerName: "MTM", field: "MTM"},
];

const pageIndex = { current: 0 };

export default function bseCashMarketPage(){
    return(
      <div className='h-screen flex flex-col'>
        <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid fileColDef={columnDefs} tableName='EQ_ITR' pageIndex={pageIndex} summaryType='symbol'/>
        </div>
      </div>
    )
}