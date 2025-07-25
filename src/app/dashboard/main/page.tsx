'use client';

import Header from '../../components/header';
import TradeGrid from '../../components/TradeGrid';
import { ColDef } from 'ag-grid-community';

const columnDefs: ColDef[] = [
  { headerName: 'Client code', field: 'clientCode' },
  { headerName: 'Branch', field: 'branch' },
  { headerName: 'Name', field: 'name' },
  { 
    headerName: 'Total Fund', 
    field: 'totalFund',
    valueGetter: (params) => {
      const { deposit=0, collateral=0} = params.data;
      return deposit + collateral
    }
  },
  { headerName: 'Deposit', field: 'deposit' },
  { headerName: 'Collateral', field: 'collateral' },
  { headerName: 'Cash Margin', field: 'cashMargin' },
  { 
    headerName: 'FO Margin', 
    field: 'foMargin',
    valueGetter: (params) => {
      const {foSpan=0, foExposure=0} = params.data;
      return foSpan + foExposure
    }
  },
  { 
    headerName: 'MCX Margin', 
    field: 'mcxMargin',
    valueGetter: (params) => {
      const {mcxSpan=0, mcxExposure=0} = params.data;
      return mcxSpan + mcxExposure
    }
  },
  { 
    headerName: 'Combined Margin', 
    field: 'combinedMargin',
    valueGetter: (params) => {
      const foMargin = (params.data.foSpan || 0) + (params.data.foExposure || 0)
      const mcxMargin = (params.data.mcxSpan || 0) + (params.data.mcxExposure || 0)
      return foMargin + mcxMargin + (params.data.cashMargin || 0)
    }
  },
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
  { 
    headerName: 'FO MTM', 
    field: 'foMtm',
    valueGetter: (params) =>{
      const {foOptionMtm=0, foFutureMtm=0} = params.data;
      return foOptionMtm + foFutureMtm; 
    }
  },
  { headerName: 'MCX Option MTM', field: 'mcxOptionMtm' },
  { headerName: 'MCX Future MTM', field: 'mcxFutureMtm' },
  { 
    headerName: 'MCX MTM', 
    field: 'mcxMtm',
    valueGetter: (params) =>{
      const {mcxOptionMtm=0, mcxFutureMtm=0} = params.data;
      return mcxOptionMtm + mcxFutureMtm; 
    }
  },
  { headerName: 'Cash MTM', field: 'cashMtm' },
  { headerName: 'Total Charges', field: 'totalCharges'},
  { 
    headerName: 'MTM Exp', 
    field: 'mtmExp', 
    valueGetter: (params) => {
      const {cashMTM=0,foOptionMtm=0, foFutureMtm=0,mcxOptionMtm=0, mcxFutureMtm=0, totalCharges=0} = params.data
      const netMTM = cashMTM + foOptionMtm + foFutureMtm + mcxOptionMtm + mcxFutureMtm
      return netMTM - totalCharges
    }
  },
  { headerName: 'FO Peak Margin', field: 'foPeakMargin'},
  { headerName: 'MCX Peak Margin', field: 'mcxPeakMargin' },
  { headerName: 'Cash Peak Margin', field: 'cashPeakMargin' },
  { headerName: 'Delivery Margin', field: 'deliveryMargin' },
  { headerName: 'Margin Percentage', field: 'marginPercentage' },
];

// Track the current page index for pagination
const pageIndex = { current: 0 };

/**
 * Dashboard Page Component
 * Displays a comprehensive overview of client trading metrics including:
 * - Fund details
 * - Margin information (FO, MCX, Combined)
 * - MTM (Mark-to-Market) calculations
 * - Peak margin details
 */
export default function DashboardPage() {
  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className="flex flex-col flex-grow">
        <TradeGrid 
          mobColDef={columnDefs} 
          fileColDef={columnDefs} 
          requestType={'aggregate'} 
          requestName='dashboard' 
          pageIndex={pageIndex}
        />
      </div>
    </div>
  );
}