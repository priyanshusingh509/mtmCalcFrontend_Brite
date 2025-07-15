'use client'; 
import Header from '../components/header';
import ProtectedRoute from '../components/ProtectedRoute';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs = [
  { headerName: "Trade.no", field: "trade_no" },
  { headerName: "Hardcoded_1", field: "hardcoded_1" },
  { headerName: "Instrument type", field: "instrument_type" },
  { headerName: "Symbol", field: "symbol" },
  { headerName: "Expiry", field: "expiry" },
  { headerName: "Stike price", field: "strike_price" },
  { headerName: "Option type", field: "option_type" },
  { headerName: "Complete Symbol", field: "full_contract_code" },
  { headerName: "Hardcoded_2", field: "hardcoded_2" },
  { headerName: "Hardcoded_3", field: "hardcoded_3" },
  { headerName: "Hardcoded_4", field: "hardcoded_4" },
  { headerName: "Trader Id", field: "trader_id" },
  { headerName: "Hardcoded_5", field: "hardcoded_5" },
  { headerName: "Hardcoded_6", field: "hardcoded_6" },
  { headerName: "Qty", field: "qty" },
  { headerName: "Price", field: "price"},
  { headerName: "Hardcoded_7", field: "hardcoded_7" },
  { headerName: "Client Id", field: "client_id" },
  { headerName: "Settlor", field: "settlor" },
  { headerName: "Hardcoded_8", field: "hardcoded_8" },
  { headerName: "Hardcoded_9", field: "hardcoded_9" },
  { headerName: "Time 1", field: "datetime_1" },
  { headerName: "Time 2", field: "datetime_2" },
  { headerName: "Order no.", field: "order_no" },
  { headerName: "TM code", field: "tm_code" },
  { headerName: "Time 3", field: "datetime_3" },
  { headerName: "Location Id", field: "location_id" }
];

const pageIndex = { current: 0 };

export default function nseFnoPage(){
    return(
      <div className='h-screen flex flex-col'>
            <Header/>
        <div className="flex-1 flex flex-col overflow-hidden">
          <TradeGrid fileColDef={columnDefs} tableName='NSE_FNO' pageIndex={pageIndex}/>
        </div>
      </div>
    )
}