'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: "CTCL ID", field: "ctcl_id" },
  { headerName: 'Algo Id', field: 'algo_id'},
  { headerName: 'Algo Category', field: 'algo_category'},
  { headerName: 'Number of Trades', field: 'nTrades' },
];

const pageIndex = { current: 0 };

export default function turnoverPage(){
  return(
      <div className='h-screen flex flex-col'>
        <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={columnDefs} fileColDef={columnDefs} tableName='NSE_FNO_Algo' pageIndex={pageIndex} summaryType='trader'/>
        </div>
      </div>
    )
}