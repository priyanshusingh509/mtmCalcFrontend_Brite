'use client'; 
import Header from '../components/header';
import ProtectedRoute from '../components/ProtectedRoute';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';


const columnDefs: ColDef[] = [
  { headerName: "ID", field: "id" },  
  { headerName: "Trade Number", field: "trade_number" },
  { headerName: "Trade Time", field: "tradeTime" },
  { headerName: "Buy/Sell", field: "buy_sell" },
  { headerName: "Symbol", field: "symbol" },
  { headerName: "Instrument Type", field: "inst_type" },
  { headerName: "Option Type", field: "opt_type" },
  { headerName: "Expiry", field: "expiry" },
  { headerName: "Strike Price", field: "strike_price" },
  { headerName: "Trade Quantity", 
    field: "trade_qty",
    valueFormatter:(params) => {
      const qty = params.value;
      const bsflag = params.data?.buy_sell?.toUpperCase();
      if (qty == null || isNaN(qty)) return '0';
      const signedQty = bsflag === 'BUY' ? qty : -qty;
      return signedQty.toString();
    },
    cellStyle: (params) => {
      const bsFlag = params.data?.buy_sell?.toUpperCase();
      return {
        color: bsFlag === 'BUY' ? 'green' : 'red'
      };
    }
  },
  { headerName: "Trade Price", field: "trade_price" },
  { headerName: "CTCL ID", field: "ctcl_id" },
  { headerName: "Broker ID", field: "broker_id" },
  { headerName: "Strategy ID", field: "strategy_id" },
  { headerName: "Strategy Name", field: "strategy_name" },
  { headerName: "User ID", field: "user_id" },
  { headerName: "Token", field: "token" },
  { headerName: "Exchange", field: "exchange" },
  { headerName: "Segment", field: "segment" },
  { headerName: "Response Order Number", field: "response_order_number" },
  { headerName: "Settlor", field: "settlor" },
  { headerName: "Old Settlor", field: "old_settlor" },
  { headerName: "Account Number", field: "account_number" },
  { headerName: "Old Account Number", field: "old_account_number" },
  { headerName: "Original Volume", field: "original_vol" },
  { headerName: "Disclosed Volume", field: "disclosed_vol" },
  { headerName: "Remaining Volume", field: "remaining_vol" },
  { headerName: "Disclosed Volume Remaining", field: "disclosed_vol_remaining" },
  { headerName: "Order Price", field: "order_price" },
  { headerName: "GTD", field: "gtd" },
  { headerName: "Volume Filled Today", field: "vol_filled_today" },
  { headerName: "Activity Type", field: "activity_type" },
  { headerName: "OP Order Number", field: "op_order_number" },
  { headerName: "OP Broker ID", field: "op_broker_id" },
  { headerName: "Open/Close", field: "open_close" },
  { headerName: "Old Open/Close", field: "old_open_close" },
  { headerName: "Book Type", field: "book_type" },
  { headerName: "New Volume", field: "new_volume" },
  { headerName: "Give Up", field: "give_up" },
  { headerName: "PAN", field: "pan" },
  { headerName: "Old PAN", field: "old_pan" },
  { headerName: "Algo ID", field: "algo_id" },
  { headerName: "Algo Category", field: "algo_category" },
  { headerName: "Last Activity Reference", field: "last_activity_reference" },
  { headerName: "NNF", field: "nnf" }
];

// const columnDefs: ColDef[] = [
//   { headerName: 'Trade no.', field: 'trade_no' },
//   { headerName: 'hardcoded_1', field: 'hardcoded_1' },
//   { headerName: 'symbol', field: 'symbol' },
//   { headerName: 'Sgmt', field: 'sgmt' },
//   { headerName: 'srcip Name', field: 'scrip_name' },
//   { headerName: 'hardcoded_2', field: 'hardcoded_2' },
//   { headerName: 'hardcoded_3', field: 'hardcoded_3' },
//   { headerName: 'hardcoded_4', field: 'hardcoded_4' },
//   { headerName: 'user id', field: 'user_id' },
//   { headerName: 'Trns typ', field: 'trns_typ' },
//   { headerName: 'b/s', field: 'b_s' },
//   { headerName: 'qty', field: 'qty' },
//   { headerName: 'rate', field: 'rate' },
//   { headerName: 'clnt/pro', field: 'clnt_pro' },
//   { headerName: 'ucc', field: 'ucc' },
//   { headerName: 'settlor', field: 'settlor' },
//   { headerName: 'hardcoded_5', field: 'hardcoded_5' },
//   { headerName: 'hardcoded_6', field: 'hardcoded_6' },
//   { headerName: 'hardcoded_7', field: 'hardcoded_7' },
//   { headerName: 'time_1', field: 'time_1' },
//   { headerName: 'time_2', field: 'time_2' },
//   { headerName: 'order no', field: 'order_no' },
//   { headerName: 'hardcoded_8', field: 'hardcoded_8' },
//   { headerName: 'time_3', field: 'time_3' },
//   { headerName: 'NNF', field: 'nnf' },
// ];

// const mobileColumnDefs: ColDef[] = [
//   { headerName: 'symbol', field: 'symbol' },
//   { headerName: 'Sgmt', field: 'sgmt' },
//   { headerName: 'srcip Name', field: 'scrip_name' },
//   { headerName: 'user id', field: 'user_id' },
//   { headerName: 'b/s', field: 'b_s' },
//   { headerName: 'qty', field: 'qty' },
//   { headerName: 'rate', field: 'rate' },
//   { headerName: 'clnt/pro', field: 'clnt_pro' },
//   { headerName: 'ucc', field: 'ucc' },
//   { headerName: 'time_1', field: 'time_1' },
//   { headerName: 'time_2', field: 'time_2' },
//   { headerName: 'time_3', field: 'time_3' },
//   { headerName: 'NNF', field: 'nnf' },
// ];


const pageIndex = { current: 0 };

export default function nseCashMarketPage(){
    return(
      <div className='h-screen flex flex-col'>
            <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={columnDefs} fileColDef={columnDefs} requestType={'table'} requestName='NSE_Cash_Algo' pageIndex={pageIndex}/>
        </div>
      </div>
    )
}