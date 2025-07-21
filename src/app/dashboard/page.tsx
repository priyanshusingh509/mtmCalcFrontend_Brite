'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: 'Client code', field: 'clnt_id' },
  { headerName: 'Branch', field: 'branch' },
  { headerName: 'Name', field: 'name' },
  { headerName: 'Total Fund', field: 'totalFund' },
  { headerName: 'Deposit', field: 'deposit' },
  { headerName: 'Collateral', field: 'collateral' },
  { headerName: 'Cash Margin', field: 'cashMargin' },
  { headerName: 'FO Margin', field: 'foMargin' },
  { headerName: 'MCX Margin', field: 'mcxMargin' },
  { headerName: 'Combined Margin', field: 'combinedMargin' },
  { headerName: 'FO Span', field: 'foSpan' },
  { headerName: 'FO exposure', field: 'foExposure' },
  { headerName: 'MCX Span', field: 'mcxSpan' },
  { headerName: 'MCX Exposure', field: 'mcxExposure' },
  { headerName: 'FO Option Premium', field: 'foOptionPremium' },
  { headerName: 'MCX Option Premium', field: 'mcxOptionPremium' },
  { headerName: 'FO Net Premium', field: 'foNetPremium' },
  { headerName: 'MCX Net Premium', field: 'mcxNetPremium' },
  { headerName: 'FO Option MTM', field: 'foOptionMtm' },
  { headerName: 'FO Future MTM', field: 'foFutureMtm' },
  { headerName: 'FO MTM', field: 'foMtm' },
  { headerName: 'MCX Option MTM', field: 'mcxOptionMtm' },
  { headerName: 'MCX Future MTM', field: 'mcxFutureMtm' },
  { headerName: 'MCX MTM', field: 'mcxMtm' },
  { headerName: 'Cash MTM', field: 'cashMtm' },
  { headerName: 'MTM Exp', field: 'mtmExp' },
  { headerName: 'FO Peak Margin', field: 'foPeakMargin' },
  { headerName: 'MCX Peak Margin', field: 'mcxPeakMargin' },
  { headerName: 'Cash Peak Margin', field: 'cashPeakMargin' },
  { headerName: 'Delivery Margin', field: 'deliveryMargin' },
  { headerName: 'Margin Percentage', field: 'marginPercentage' },
];
setTimeout(() => {
  console.log(document.cookie.split(";").find(row => row.startsWith('username='))?.split('=')[1]);
}, 7000);
const pageIndex = { current: 0 };

export default function bseCashMarketPage(){
    return(
      <div className='h-screen flex flex-col'>
        <Header/>
        <div className="flex flex-col flex-grow">
          <TradeGrid mobColDef={columnDefs} fileColDef={columnDefs} requestType={'aggregate'} requestName='dashboard' pageIndex={pageIndex}/>
        </div>
      </div>
    )
} 