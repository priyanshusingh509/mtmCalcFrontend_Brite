'use client';

import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import oboe from 'oboe';

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

interface TradeRow {
  membr_id: number;
  trdr_id: number;
  scrp_code: number;
  scrp_id: string;
  rate: number;
  qty: number;
  trd_status: number;
  cm_code: number;
  time: string;
  date: string;
  clnt_id: string;
  ordr_id: number;
  trns_type: string;
  bs_flag: string;
  trade_id: number;
  clnt_type: string;
  isin: string;
  scrp_group: string;
  sett_no: string;
  ord_time: string;
  ao_po_flag: boolean;
  location_id: number;
  trd_mod_time: string;
  session_id: number;
  cp_code: string;
  cp_code_confrn: string;
  old_cust_participant: string;
  old_cust_code: string;
}

const PAGE_SIZE = 300;

const TradeGrid = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  const [inputPage, setInputPage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageIndex = useRef(0);
  const gridRef = useRef<any>(null);

const columnDefs: ColDef[] = [
  {
    headerName: 'Index',
    valueGetter: (params) => {
      const rowIndex = params.node?.rowIndex ?? 0;
      return pageIndex.current * PAGE_SIZE + rowIndex;
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

  const keepOnlyThreePages = () => {
    const curr = pageIndex.current;
    const valid = [`page-${curr - 1}`, `page-${curr}`, `page-${curr + 1}`];
    Object.keys(localStorage).forEach(key => {
      if (!valid.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };

const fetchPageViaGoto = (start: number) => {
  let currentChunk: TradeRow[] = [];
  let nextChunk: TradeRow[] = [];
  let prevChunk: TradeRow[] = [];

  let stage: 'current' | 'next' | 'prev' | 'done' = 'current';


  oboe(`http://192.168.4.200:3000/goto?start=${start}&limit=${PAGE_SIZE}`)
    .node('![*]', (node: any) => {
      if (JSON.stringify(node) === '"stawp"') {
        stage = 'next';
        return oboe.drop;
      }

      if (node?.data === null) {
        if (stage === 'next') stage = 'prev';
        else if (stage === 'prev') stage = 'done';
        return oboe.drop;
      }

      switch (stage) {
        case 'current':
          currentChunk.push(node);
          break;
        case 'next':
          nextChunk.push(node);
          break;
        case 'prev':
          prevChunk.push(node);
          break;
      }
    })
    .done(() => {
      const curr = pageIndex.current;

      // Set row data from current page
      setRowData(currentChunk);
      localStorage.setItem(`page-${curr}`, JSON.stringify(currentChunk));
      console.log('curr', currentChunk);

      if (nextChunk.length > 0) {
        localStorage.setItem(`page-${curr + 1}`, JSON.stringify(nextChunk));
        console.log('next', nextChunk);
      }

      if (curr > 0 && prevChunk.length > 0) {
        localStorage.setItem(`page-${curr - 1}`, JSON.stringify(prevChunk));
        console.log('prev', prevChunk);
      }

      keepOnlyThreePages();
    })
    .fail((err) => {
      console.error('Oboe failed:', err);
    });
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
    if (isNaN(page) || page < 1) return;
    pageIndex.current = page - 1;
    localStorage.clear(); // reset everything
    fetchPageViaGoto(pageIndex.current * PAGE_SIZE);
  };

  const fetchConsecutive = (page: number, forward: boolean) => {
    const start = page * PAGE_SIZE;
    fetch(`http://192.168.4.200:3000/consecutivesend?start=${start}&limit=${PAGE_SIZE}&action=${forward}`)
      .then((res) => res.json())
      .then((data: TradeRow[]) => {
        const targetPage = page;
        localStorage.setItem(`page-${targetPage}`, JSON.stringify(data));
      })
      .catch((err) => {
        console.error('Error prefetching:', err);
      });
      console.log("this ran")
  };

  useEffect(() => {
    fetch('http://192.168.4.200:3000/totalrecords')
    .then(res => res.json())
    .then(({ total }) => {
      setTotalRecords(total);
      setTotalPages(Math.ceil(total / PAGE_SIZE));
    });

    pageIndex.current = 0;
    fetchPageViaGoto(0);    
  }, []);

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Pagination Controls */}
      <div className="flex justify-center items-center p-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={pageIndex.current === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬅️ Previous
        </button>
        <span className="px-4 py-2 text-lg font-semibold">
          Page {pageIndex.current + 1}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next ➡️
        </button>

        <input
          type="number"
          min="1"
          value={inputPage}
          onChange={handleInputPageChange}
          onKeyPress={handleKeyPress}
          placeholder="Go to page"
          className="ml-4 p-2 border border-gray-300 rounded w-32 text-center"
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
