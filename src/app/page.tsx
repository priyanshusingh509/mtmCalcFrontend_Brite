'use client';

import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
const oboe = require('oboe');

import {
  ModuleRegistry,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
]);

// ==============================
// Types
// ==============================
interface TradeRow {
  'Membr id': number;
  'trdr id': number;
  'scrp code': number;
  'scrp id': string;
  'rate': number;
  'qty': number;
  'trd status': number;
  'Cm code': number;
  'Time': string;
  'Date': string;
  'Clnt id': string;
  'Ordr id': number;
  'Trns typ/Ordr typ': string;
  'B/S': string;
  'Trade ID': number;
  'Clnt typ': string;
  'ISIN': string;
  'scrp group': string;
  'Sett No': string;
  'Ord Time': string;
  'Ao/Po flag': boolean;
  'Location id': number;
  'Trd modi. time/time': string;
  'Sessn Id or trdr Id': number;
  'CP Code': string;
  'CP code Confrn': string;
  'Old Cust Prtcpnt': string;
  'Old Cust code': string;
}

// ==============================
// Component
// ==============================
const TradeGrid = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [cache, setCache] = useState<{ [key: number]: TradeRow[] }>({});
  const gridRef = useRef<AgGridReact<TradeRow>>(null);

  const pageSize = 300;
  const chunkSize = 900;

  // ==============================
  // Column Definitions
  // ==============================
 const columnDefs: ColDef<TradeRow>[] = [
  { headerName: 'Member ID', field: 'Membr id' },
  { headerName: 'Trader ID', field: 'trdr id' },
  { headerName: 'Script Code', field: 'scrp code' },
  { headerName: 'Script ID', field: 'scrp id' },
  { headerName: 'Rate', field: 'rate' },
  { headerName: 'Quantity', field: 'qty' },
  { headerName: 'Trade Status', field: 'trd status' },
  { headerName: 'CM Code', field: 'Cm code' },
  { headerName: 'Time', field: 'Time' },
  { headerName: 'Date', field: 'Date' },
  { headerName: 'Client ID', field: 'Clnt id' },
  { headerName: 'Order ID', field: 'Ordr id' },
  { headerName: 'Transaction Type / Order Type', field: 'Trns typ/Ordr typ' },
  { headerName: 'Buy/Sell', field: 'B/S' },
  { headerName: 'Trade ID', field: 'Trade ID' },
  { headerName: 'Client Type', field: 'Clnt typ' },
  { headerName: 'ISIN', field: 'ISIN' },
  { headerName: 'Script Group', field: 'scrp group' },
  { headerName: 'Settlement No.', field: 'Sett No' },
  { headerName: 'Order Time', field: 'Ord Time' },
  { headerName: 'AO/PO Flag', field: 'Ao/Po flag' },
  { headerName: 'Location ID', field: 'Location id' },
  { headerName: 'Trade Modified Time', field: 'Trd modi. time/time' },
  { headerName: 'Session ID or Trader ID', field: 'Sessn Id or trdr Id' },
  { headerName: 'CP Code', field: 'CP Code' },
  { headerName: 'CP Code Confirmation', field: 'CP code Confrn' },
  { headerName: 'Old Custodian Participant', field: 'Old Cust Prtcpnt' },
  { headerName: 'Old Custodian Code', field: 'Old Cust code' },
];


  const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
    filter: true,
  };

  // ==============================
  // Fetch Chunk of 900 (3 pages)
  // ==============================
  const fetchChunk = (chunkStartPage: number) => {
    const start = chunkStartPage * pageSize;
    const tempCache: { [key: number]: TradeRow[] } = {
      [chunkStartPage]: [],
      [chunkStartPage + 1]: [],
      [chunkStartPage + 2]: [],
    };
    let counter = 0;

    oboe({
      url: `http://localhost:3000/fetchmock?start=${start}&limit=${chunkSize}`,
      method: 'GET',
    })
      .node('![*]', (trade: TradeRow) => {
        const page = chunkStartPage + Math.floor(counter / pageSize);
        tempCache[page].push(trade);

        if (counter === 0) {
          setRowData([trade]);
          setPageIndex(chunkStartPage);
        } else if (counter === pageSize - 1 && page === chunkStartPage) {
          setRowData([...tempCache[chunkStartPage]]);
        }

        counter++;
        return oboe.drop;
      })
      .done(() => {
        console.log(`✅ Stream done. Cached pages ${chunkStartPage}–${chunkStartPage + 2}`);
        setCache((prev) => ({ ...prev, ...tempCache }));
      });
  };

  // ==============================
  // Handle Page Switch
  // ==============================
  const goToPage = (index: number) => {
    setPageIndex(index);

    if (cache[index]) {
      setRowData(cache[index]);
    } else {
      const chunkStartPage = Math.floor(index / 3) * 3;
      fetchChunk(chunkStartPage);
    }
  };

  const handleNext = () => goToPage(pageIndex + 1);
  const handlePrev = () => {
    if (pageIndex > 0) goToPage(pageIndex - 1);
  };

  useEffect(() => {
    fetchChunk(0); // Load pages 0–2 initially
  }, []);

  return (
    <div className="w-full">
      {/* Pagination Controls */}
      <div
        className="flex justify-center mt-4 gap-[0.1rem]"
      >
        <button onClick={handlePrev} disabled={pageIndex === 0}>
          ⬅️ Previous
        </button>
        <span>Page {pageIndex + 1}</span>
        <button onClick={handleNext}>Next ➡️</button>
      </div>

      {/* AG Grid */}
      <div className="ag-theme-alpine h-[600px] w-full">
        <AgGridReact<TradeRow>
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default TradeGrid;
