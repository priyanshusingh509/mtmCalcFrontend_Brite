'use client'; 
import Header from '../components/header';
import ProtectedRoute from '../components/ProtectedRoute';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: 'Trade no.', field: 'trade_no' },
  { headerName: 'hardcoded_1', field: 'hardcoded_1' },
  { headerName: 'symbol', field: 'symbol' },
  { headerName: 'Sgmt', field: 'sgmt' },
  { headerName: 'srcip Name', field: 'scrip_name' },
  { headerName: 'hardcoded_2', field: 'hardcoded_2' },
  { headerName: 'hardcoded_3', field: 'hardcoded_3' },
  { headerName: 'hardcoded_4', field: 'hardcoded_4' },
  { headerName: 'user id', field: 'user_id' },
  { headerName: 'Trns typ', field: 'trns_typ' },
  { headerName: 'b/s', field: 'b_s' },
  { headerName: 'qty', field: 'qty' },
  { headerName: 'rate', field: 'rate' },
  { headerName: 'clnt/pro', field: 'clnt_pro' },
  { headerName: 'ucc', field: 'ucc' },
  { headerName: 'settlor', field: 'settlor' },
  { headerName: 'hardcoded_5', field: 'hardcoded_5' },
  { headerName: 'hardcoded_6', field: 'hardcoded_6' },
  { headerName: 'hardcoded_7', field: 'hardcoded_7' },
  { headerName: 'time_1', field: 'time_1' },
  { headerName: 'time_2', field: 'time_2' },
  { headerName: 'order no', field: 'order_no' },
  { headerName: 'hardcoded_8', field: 'hardcoded_8' },
  { headerName: 'time_3', field: 'time_3' },
  { headerName: 'NNF', field: 'nnf' },
];

const mobileColumnDefs: ColDef[] = [
  { headerName: 'symbol', field: 'symbol' },
  { headerName: 'Sgmt', field: 'sgmt' },
  { headerName: 'srcip Name', field: 'scrip_name' },
  { headerName: 'user id', field: 'user_id' },
  { headerName: 'b/s', field: 'b_s' },
  { headerName: 'qty', field: 'qty' },
  { headerName: 'rate', field: 'rate' },
  { headerName: 'clnt/pro', field: 'clnt_pro' },
  { headerName: 'ucc', field: 'ucc' },
  { headerName: 'time_1', field: 'time_1' },
  { headerName: 'time_2', field: 'time_2' },
  { headerName: 'time_3', field: 'time_3' },
  { headerName: 'NNF', field: 'nnf' },
];


const pageIndex = { current: 0 };

export default function nseCashMarketPage(){
    return(
      <div className='h-screen flex flex-col'>
            <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={mobileColumnDefs} fileColDef={columnDefs} tableName='NSE_CM_tradeFile' pageIndex={pageIndex}/>
        </div>
      </div>
    )
}