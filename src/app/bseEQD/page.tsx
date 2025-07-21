'use client';
import Header from '../components/header';
import ProtectedRoute from '../components/ProtectedRoute';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: "Trade Number", field: "TradeNumber" },
  { headerName: "Trade Date Time", field: "TradeDateTime" },
  { headerName: "Trade Status", field: "TradeStatus" },
  { headerName: "Segment Indicator", field: "SegmentIndicator" },
  { headerName: "Settlement Type", field: "SettlementType" },
  { headerName: "Product Type", field: "ProductType" },
  { headerName: "Product Code", field: "ProductCode" },
  { headerName: "Asset Code", field: "AssetCode" },
  { headerName: "Expiry Date", field: "ExpiryDate" },
  { headerName: "Strike Price", field: "StrikePrice" },
  { headerName: "Option Type", field: "OptionType" },
  { headerName: "Series Code", field: "SeriesCode" },
  { headerName: "Buy Broker", field: "BuyBroker" },
  { headerName: "Sell Broker", field: "SellBroker" },
  { headerName: "Trade Price", field: "TradePrice" },
  { headerName: "Trade Quantity", field: "TradeQuantity" },
  { headerName: "Series ID", field: "SeriesID" },
  { headerName: "Trade Buyer Location ID", field: "TradeBuyerLocationID" },
  { headerName: "Buy CM Code", field: "BuyCMCode" },
  { headerName: "Sell CM Code", field: "SellCMCode" },
  { headerName: "Trade Seller Location ID", field: "TradeSellerLocationID" },
  { headerName: "Buy Custodial Participant", field: "BuyCustodialParticipant" },
  { headerName: "Buy Side Confirmation", field: "BuySideConfirmation" },
  { headerName: "Sell Custodial Participant", field: "SellCustodialParticipant" },
  { headerName: "Sell Side Confirmation", field: "SellSideConfirmation" },
  { headerName: "Buy Covered Uncovered Flag", field: "BuyCoveredUncoveredFlag" },
  { headerName: "Sell Covered Uncovered Flag", field: "SellCoveredUncoveredFlag" },
  { headerName: "Buy Old Custodial Participant", field: "BuyOldCustodialParticipant" },
  { headerName: "Buy Old CM Code", field: "BuyOldCMCode" },
  { headerName: "Sell Old Custodial Participant", field: "SellOldCustodialParticipant" },
  { headerName: "Sell Old CM Code", field: "SellOldCMCode" },
  { headerName: "Trade Buyer Terminal ID", field: "TradeBuyerTerminalID" },
  { headerName: "Trade Seller Terminal ID", field: "TradeSellerTerminalID" },
  { headerName: "Buy Order No", field: "BuyOrderNo" },
  { headerName: "Sell Order No", field: "SellOrderNo" },
  { headerName: "Buy Client Code", field: "BuyClientCode" },
  { headerName: "Sell Client Code", field: "SellClientCode" },
  { headerName: "Buy Remarks", field: "BuyRemarks" },
  { headerName: "Sell Remarks", field: "SellRemarks" },
  { headerName: "Buy Position", field: "BuyPosition" },
  { headerName: "Sell Position", field: "SellPosition" },
  { headerName: "Buy Proprietor/Client Flag", field: "BuyProprietorClientFlag" },
  { headerName: "Sell Proprietor/Client Flag", field: "SellProprietorClientFlag" },
  { headerName: "Buy Order Time Stamp", field: "BuyOrderTimeStamp" },
  { headerName: "Sell Order Time Stamp", field: "SellOrderTimeStamp" },
  { headerName: "Buy Order Active Flag", field: "BuyOrderActiveFlag" },
  { headerName: "Sell Order Active Flag", field: "SellOrderActiveFlag" },
];

const mobileColumnDefs: ColDef[] = [
  { headerName: "Trade Number", field: "TradeNumber" },
  { headerName: "Trade Date Time", field: "TradeDateTime" },
  { headerName: "Expiry Date", field: "ExpiryDate" },
  { headerName: "Strike Price", field: "StrikePrice" },
  { headerName: "Option Type", field: "OptionType" },
  { headerName: "Series Code", field: "SeriesCode" },
  { headerName: "Trade Price", field: "TradePrice" },
  { headerName: "Trade Quantity", field: "TradeQuantity" },
  { headerName: "Trade Buyer Terminal ID", field: "TradeBuyerTerminalID" },
  { headerName: "Trade Seller Terminal ID", field: "TradeSellerTerminalID" },
  { headerName: "Buy Client Code", field: "BuyClientCode" },
  { headerName: "Sell Client Code", field: "SellClientCode" },
  { headerName: "Buy Position", field: "BuyPosition" },
  { headerName: "Sell Position", field: "SellPosition" },
  { headerName: "Buy Order Time Stamp", field: "BuyOrderTimeStamp" },
  { headerName: "Sell Order Time Stamp", field: "SellOrderTimeStamp" },
  { headerName: "Buy Order Active Flag", field: "BuyOrderActiveFlag" },
  { headerName: "Sell Order Active Flag", field: "SellOrderActiveFlag" },
];

const pageIndex = { current: 0 };

export default function bseEQDPage(){
    return(
      <div className='h-screen flex flex-col'>
        <Header/>
        <div className="flex-grow flex flex-col">
          <TradeGrid mobColDef={mobileColumnDefs} fileColDef={columnDefs} requestType={'table'} requestName='EQD_ITRTM' pageIndex={pageIndex}/>
        </div>
      </div>
    )
}