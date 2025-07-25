'use client';

import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';
import { memo } from 'react';


interface TradeData {
  side?: number;
  [key: string]: any;
}

/**
 * Custom cell renderer component for quantity display
 * Shows negative values in red and positive values in green
 * Based on the buy/sell flag ('BUY' or 'SELL')
 */
const QuantityCellRenderer = memo(({ value, data }: { value: any; data: TradeData }) => {
  // Handle null/undefined or non-numeric values
  if (value == null || isNaN(Number(value))) return '0';

  const bsFlag = data?.side;
  // Convert to negative if it's a sell order
  const signedQty = bsFlag === 1 ? Number(value) : -Number(value);
  const isNegative = signedQty < 0;
  const colorClass = isNegative ? 'text-red-500' : 'text-green-500';

  return <div className={colorClass}>{signedQty}</div>;
});

// Column definitions for desktop view (detailed)
const desktopColumnDefs: ColDef[] = [
  { headerName: "RelatedSecurityId", field: "related_security_id" },
  { headerName: "Price", field: "price" },
  { headerName: "LastPrice", field: "last_price" },
  { headerName: "SideLastPrice", field: "side_last_price" },
  { headerName: "ClearingTradePrice", field: "clearing_trade_price" },
  { headerName: "TransactTime", field: "transaction_time" },
  { headerName: "OrderId", field: "order_id" },
  { headerName: "TerminalInfo", field: "terminal_info" },
  { headerName: "ClOrderId", field: "cl_order_id" },
  { headerName: "LastUpdateTime", field: "last_updated_time" },
  { headerName: "StrategyId", field: "strategy_id" },
  { headerName: "StrategySequenceNo", field: "strategy_sequence_no" },
  { headerName: "LastQty", field: "last_qty", cellRenderer: QuantityCellRenderer },
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
  { headerName: "MatchDate", field: "matchDate" },
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

// Page index state for pagination
const pageIndex = { current: 0 };

/**
 * MCX Trades Page Component
 * Displays commodity trading data from MCX (Multi Commodity Exchange)
 */
export default function MCXPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid
          mobColDef={desktopColumnDefs}
          fileColDef={desktopColumnDefs}
          requestType="table"
          requestName="MCX"
          pageIndex={pageIndex}
        />
      </div>
    </div>
  );
}