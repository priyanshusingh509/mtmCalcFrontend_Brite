'use client'; 
import Header from '../components/header';
import ProtectedRoute from '../components/ProtectedRoute';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  // { headerName: 'Member ID', field: 'membr_id' },
  { headerName: 'Trader ID', field: 'trdr_id' },
  // { headerName: 'Script Code', field: 'scrp_code' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Rate', field: 'rate' },
  { headerName: 'Quantity', field: 'qty' },
  // { headerName: 'Trade Status', field: 'trd_status' },
  { headerName: 'CM Code', field: 'cm_code' },
  { headerName: 'Time', field: 'time' },
  // { headerName: 'Date', field: 'date' },
  { headerName: 'Client ID', field: 'clnt_id' },
  { headerName: 'Order ID', field: 'ordr_id' },
  // { headerName: 'Transaction Type / Order Type', field: 'trns_type' },
  // { headerName: 'Buy/Sell', field: 'bs_flag' },
  { headerName: 'Trade ID', field: 'trade_id' },
  // { headerName: 'Client Type', field: 'clnt_type' },
  { headerName: 'ISIN', field: 'isin' },
  // { headerName: 'Script Group', field: 'scrp_group' },
  { headerName: 'Settlement No.', field: 'sett_no' },
  { headerName: 'Order Time', field: 'ord_time' },
  // { headerName: 'AO/PO Flag', field: 'ao_po_flag' },
  { headerName: 'Location ID', field: 'location_id' },
  { headerName: 'Trade Modified Time', field: 'trd_mod_time' },
  // { headerName: 'Session ID or Trader ID', field: 'session_id' },
  { headerName: 'CP Code', field: 'cp_code' },
  // { headerName: 'CP Code Confirmation', field: 'cp_code_confrn' },
  // { headerName: 'Old Custodian Participant', field: 'old_cust_participant' },
  // { headerName: 'Old Custodian Code', field: 'old_cust_code' }
];

const mobilecolumnDefs: ColDef[] = [
  { headerName: 'Trader ID', field: 'trdr_id' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Rate', field: 'rate' },
  { headerName: 'Quantity', field: 'qty' },
  { headerName: 'Time', field: 'time' },
  { headerName: 'Client ID', field: 'clnt_id' },
  { headerName: 'Order ID', field: 'ordr_id' },
  { headerName: 'Buy/Sell', field: 'bs_flag' },
  { headerName: 'Trade ID', field: 'trade_id' },
  { headerName: 'Order Time', field: 'ord_time' },
  { headerName: 'Trade Modified Time', field: 'trd_mod_time' }
];


const pageIndex = { current: 0 };

export default function bseCashMarketPage(){
    return(
      <div className='h-screen flex flex-col'>
            <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={mobilecolumnDefs} fileColDef={columnDefs} tableName='EQ_ITR' pageIndex={pageIndex}/>
        </div>
      </div>
    )
}