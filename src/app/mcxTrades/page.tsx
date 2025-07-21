'use client'; 
import Header from '../components/header';
import ProtectedRoute from '../components/ProtectedRoute';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: "RelatedSecurityId", field: "related_security_id" },
  { headerName: "Price", field: "price" },
  { headerName: "LastPrice", field: "last_price" },
  { headerName: "SideLastPrice", field: "side_last_price" },
  { headerName: "ClearingTradePrice", field: "clearing_trade_price" },
  { headerName: "TransactTime", field: "transaction_time" },
  { headerName: "OrderId", field: "order_id" },
  { headerName: "TerminalInfo", field: "terminal_info" },
  { headerName: "ClOrderId", field: "cl_order_id" },
  { headerName: "LastUpdateTime", field: "last_update_time" },
  { headerName: "StrategyId", field: "strategy_id" },
  { headerName: "StrategySequenceNo", field: "strategy_sequence_no" },
  { headerName: "LastQty", field: "last_qty" },
  { headerName: "SideLastQty", field: "side_last_qty" },
  { headerName: "CumQuantity", field: "cum_quantity" },
  { headerName: "LeaveQuantity", field: "leave_quantity" },
  { headerName: "SimpleSecurityId", field: "simple_security_id" },
  { headerName: "_echo", field: "echo" },
  { headerName: "TradeId", field: "trade_id" },
  { headerName: "OriginalTradeId", field: "original_trade_id" },
  { headerName: "RootPartyIdExecutingUnit", field: "root_party_id_executing_unit" },
  { headerName: "RootPartyIdSessionId", field: "root_party_id_session_id" },
  { headerName: "RootPartyIdExecutingTrader", field: "root_party_id_executing_trader" },
  { headerName: "RootPartyIdClearingUnit", field: "root_party_id_clearing_unit" },
  { headerName: "MarketSegmentId", field: "market_segment_id" },
  { headerName: "SideTradeId", field: "side_trade_id" },
  { headerName: "MatchDate", field: "match_date" },
  { headerName: "TradeMatchId", field: "trade_match_id" },
  { headerName: "StrategyLinkId", field: "strategy_link_id" },
  { headerName: "TotalNumTradeReports", field: "total_num_trade_reports" },
  { headerName: "AccountId", field: "account_id" },
  { headerName: "MultiLegReportType", field: "multi_leg_report_type" },
  { headerName: "TradeReportType", field: "trade_report_type" },
  { headerName: "TransferReason", field: "transfer_reason" },
  { headerName: "RootPartyIdBeneficiary", field: "root_party_id_beneficiary" },
  { headerName: "RootPartyIdTakeUpTradingFirm", field: "root_party_id_take_up_trading_firm" },
  { headerName: "RootPartyIdOrderOriginationFirm", field: "root_party_id_order_origination_firm" },
  { headerName: "AccountType", field: "account_type" },
  { headerName: "MatchType", field: "match_type" },
  { headerName: "MatchSubType", field: "match_sub_type" },
  { headerName: "Side", field: "side" },
  { headerName: "AggressorIndicator", field: "aggressor_indicator" },
  { headerName: "TradingCapacity", field: "trading_capacity" },
  { headerName: "PostionEffect", field: "position_effect" },
  { headerName: "CustomerOrderHandlingInst", field: "customer_order_handling_inst" },
  { headerName: "CPCode", field: "cp_code" },
  { headerName: "OrderCategory", field: "order_category" },
  { headerName: "OrderType", field: "order_type" },
  { headerName: "RelatedComplexProduct", field: "related_complex_product" },
  { headerName: "OrderSide", field: "order_side" },
  { headerName: "RootPartyClearingOrganization", field: "root_party_clearing_organization" },
  { headerName: "RootPartyExecutingFirm", field: "root_party_executing_firm" },
  { headerName: "RootPartyExecutingTrade", field: "root_party_executing_trade" },
  { headerName: "RootPartyClearingFirm", field: "root_party_clearing_firm" }
];


const pageIndex = { current: 0 };

export default function bseCashMarketPage(){
    return(
      <div className='h-screen flex flex-col'>
            <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={columnDefs} fileColDef={columnDefs} requestType={'table'} requestName='MCX' pageIndex={pageIndex}/>
        </div>
      </div>
    )
}