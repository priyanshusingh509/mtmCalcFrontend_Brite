'use client';

import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import oboe from 'oboe';


import { useTradeData } from '../hooks/UseTradeData';


import {
  ModuleRegistry,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule
]);

import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';


const TradeGrid = () => {
  const [inputPage, setInputPage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const gridRef = useRef<any>(null);
  const {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    pageIndex, // 👈 bring it from the hook directly
  } = useTradeData();

  const columnDefs: ColDef[] = [
  {
    headerName: 'Index',
    valueGetter: (params) => {
      const rowIndex = params.node?.rowIndex ?? 0;
      return pageIndex.current * PAGE_SIZE + rowIndex + 1;
    },
    width: 100,
    cellClass: 'font-bold text-center'
  },
  { headerName: 'Member ID', field: 'membr_id' },
  { headerName: 'Trader ID', field: 'trdr_id' },
  { headerName: 'Script Code', field: 'scrp_code' },
  { headerName: 'Script ID', field: 'scrp_id' },
  { headerName: 'Rate', field: 'rate' },
  { headerName: 'Quantity', field: 'qty' },
  { headerName: 'Trade Status', field: 'trd_status' },
  { headerName: 'CM Code', field: 'cm_code' },
  { headerName: 'Time', field: 'time' },
  { headerName: 'Date', field: 'date' },
  { headerName: 'Client ID', field: 'clnt_id' },
  { headerName: 'Order ID', field: 'ordr_id' },
  { headerName: 'Transaction Type / Order Type', field: 'trns_type' },
  { headerName: 'Buy/Sell', field: 'bs_flag' },
  { headerName: 'Trade ID', field: 'trade_id' },
  { headerName: 'Client Type', field: 'clnt_type' },
  { headerName: 'ISIN', field: 'isin' },
  { headerName: 'Script Group', field: 'scrp_group' },
  { headerName: 'Settlement No.', field: 'sett_no' },
  { headerName: 'Order Time', field: 'ord_time' },
  { headerName: 'AO/PO Flag', field: 'ao_po_flag' },
  { headerName: 'Location ID', field: 'location_id' },
  { headerName: 'Trade Modified Time', field: 'trd_mod_time' },
  { headerName: 'Session ID or Trader ID', field: 'session_id' },
  { headerName: 'CP Code', field: 'cp_code' },
  { headerName: 'CP Code Confirmation', field: 'cp_code_confrn' },
  { headerName: 'Old Custodian Participant', field: 'old_cust_participant' },
  { headerName: 'Old Custodian Code', field: 'old_cust_code' }
];



  const defaultColDef: ColDef = {
    resizable: true,
    filter: true,
    sortable: true
  };




  const handlePrev = () => {
    if (pageIndex.current === 0) return;

    pageIndex.current -= 1;
    const curr = pageIndex.current;
    const prev = curr - 1;  

    const currentCached = localStorage.getItem(`page-${curr}`);
    if (currentCached) {
      setRowData(JSON.parse(currentCached));
    }

    keepOnlyThreePages();
    fetchConsecutive(prev, false);

    // if (!localStorage.getItem(`page-${prev}`) && curr > 0) {
    // }
    // if (!localStorage.getItem(`page-${next}`)) {
    //   fetchConsecutive(curr+1, true);
    // }
  };

  const handleNext = () => {
    pageIndex.current += 1;
    const curr = pageIndex.current;
    const next = curr + 1;

    const currentCached = localStorage.getItem(`page-${curr}`);
    if (currentCached) {
      setRowData(JSON.parse(currentCached));
    }

    keepOnlyThreePages();

    fetchConsecutive(next, true);
    // if (!localStorage.getItem(`page-${next}`)) {
    // }
    // if (!localStorage.getItem(`page-${prev}`) && curr > 0) {
    //   fetchConsecutive(curr+1, false);
    // }
  };

  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToInputPage();
    }
  };

  const handleGoToInputPage = () => {
    const page = parseInt(inputPage);
    if (isNaN(page) || page < 1 || page>totalPages){
      alert("page does not exist");
      return;
    } 
    pageIndex.current = page - 1;
    localStorage.clear(); // reset everything
    fetchPageViaGoto(pageIndex.current * PAGE_SIZE);
  };

  useEffect(() => {
    fetch('http://192.168.4.198:3000/totalrecords')
    .then(res => res.json())
    .then(({ total }) => {
      setTotalRecords(total);
      setTotalPages(Math.ceil(total / PAGE_SIZE));
      console.log(Math.ceil(total / PAGE_SIZE));
    });

    pageIndex.current = 0;
    fetchPageViaGoto(0);    
    // console.log("this ran")
  }, []);

  // console.log("this should work ",totalPages);

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Pagination Controls */}
      <div className="flex justify-center items-center p-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={pageIndex.current === 0}
          className="px-4 py-2 w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-lg font-semibold">
          Page {pageIndex.current + 1} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={pageIndex.current === (totalPages - 1)}
          className="px-4 py-2 w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>

        <input
          type="number"
          min="1"
          value={inputPage}
          onChange={handleInputPageChange}
          onKeyPress={handleKeyPress}
          placeholder="Search"
          className="ml-4 p-2 w-[10vw] border border-gray-300 rounded text-center"
        />
        <button
          onClick={handleGoToInputPage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go
        </button>
      </div>

      {/* AG Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact<TradeRow>
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="normal"
          />
        </div>
      </div>
      
    </div>
  );
};

export default TradeGrid;
