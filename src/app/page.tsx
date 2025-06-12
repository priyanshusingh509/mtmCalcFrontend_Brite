'use client';

import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
const oboe = require('oboe');

import {
  ModuleRegistry,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule, 
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule
]);

// ==============================
// Constants for LocalStorage Keys
// ==============================
const LOCAL_STORAGE_CHUNK_DATA_KEY = 'ag_grid_current_chunk_data';
const LOCAL_STORAGE_CHUNK_START_PAGE_KEY = 'ag_grid_current_chunk_start_page';

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
  // No longer using useState for `cache`, it's now managed in localStorage
  const [inputPage, setInputPage] = useState('');
  const gridRef = useRef<AgGridReact<TradeRow>>(null);

  const pageSize = 300;
  const chunkSize = 900; // This is (3 * pageSize)

  // ==============================
  // Column Definitions
  // ==============================
  const columnDefs: ColDef<TradeRow>[] = [
  {
      headerName: 'Index',
      valueGetter: (params: ValueGetterParams) => {
      const rowIndex = params.node?.rowIndex;
      return typeof rowIndex === 'number' ? (pageIndex * pageSize) + rowIndex+1 : '';
      },
      width: 90,
      minWidth: 50,
      maxWidth: 100,
      sortable: false,
      filter: false,
      pinned: 'left',
      cellClass: 'text-center',
      suppressNavigable: true,
      resizable: false,
    },
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
  // Fetch Chunk of 900 (3 pages) and store in localStorage
  // ==============================
  const fetchChunk = (chunkStartPage: number) => {
    const start = chunkStartPage * pageSize;
    console.log("start ", start);
    // tempCache will temporarily hold the 3 pages as they stream in
    const tempCache: { [key: number]: TradeRow[] } = {
      [chunkStartPage]: [],
      [chunkStartPage + 1]: [],
      [chunkStartPage + 2]: [],
    };
    let counter = 0;
    const allChunkData: TradeRow[] = []; // To accumulate all 900 records for localStorage

    oboe({
      url: `http://localhost:3000/fetchmock?start=${start}&limit=${chunkSize}`,
      method: 'GET',
    })
      .node('![*]', (trade: TradeRow) => {
        const page = chunkStartPage + Math.floor(counter / pageSize); 
        console.log(page , " page : chunkstartpage ", chunkStartPage);
        // Ensure the page array exists in tempCache (redundant given initialization but good practice)
        if (!tempCache[page]) {
          tempCache[page] = [];
        }
        tempCache[page].push(trade);
        allChunkData.push(trade); // Add to the array for full chunk storage

        // Live update the grid with the first record/page for responsiveness
        if (counter === 0 && page === pageIndex) {
          setRowData([trade]);
        } else if (counter === pageSize - 1 && page === pageIndex) {
          setRowData([...tempCache[pageIndex]]);
        }

        counter++;
        return oboe.drop;
      })
      .done(() => {
        console.log(`✅ Stream done. Fetched chunk starting at page ${chunkStartPage + 1}`);

        // Store the entire 900-record chunk and its start page in localStorage
        try {
          localStorage.setItem(LOCAL_STORAGE_CHUNK_DATA_KEY, JSON.stringify(allChunkData));
          localStorage.setItem(LOCAL_STORAGE_CHUNK_START_PAGE_KEY, chunkStartPage.toString());
          console.log(`📦 Cached chunk ${chunkStartPage} in localStorage. ${LOCAL_STORAGE_CHUNK_DATA_KEY}`);

        } catch (error) {
          console.error("❌ Failed to store chunk in localStorage:", error);
          alert("Warning: Local storage limit reached or inaccessible. Data might not be cached.");
        }


        // After the stream is done, ensure the rowData for the currently desired page is set.
        // This is important if `goToPage` was called and `fetchChunk` initiated,
        // and the data wasn't fully rendered by the time the stream finished.
        if (tempCache[pageIndex]) {
          setRowData(tempCache[pageIndex]);
        }
      })
      .fail((error: any) => {
        console.error("❌ Oboe stream failed:", error);
        alert("Error fetching data. Please check your network connection and try again.");
      });
  };

  // ==============================
  // Handle Page Switch
  // ==============================
  const goToPage = (index: number) => {
    if (index < 0) {
      console.warn("Attempted to go to a negative page index.");
      return;
    }

    setPageIndex(index); // Always update pageIndex immediately for UI feedback

    const requestedChunkStartPage = Math.floor(index / 3) * 3; // Calculate the start page of the chunk containing the requested page

    try {
      // Try to read the currently cached chunk and its metadata from localStorage
      const storedChunkData = localStorage.getItem(LOCAL_STORAGE_CHUNK_DATA_KEY);
      const storedChunkStartPageStr = localStorage.getItem(LOCAL_STORAGE_CHUNK_START_PAGE_KEY);
      const storedChunkStartPage = storedChunkStartPageStr ? parseInt(storedChunkStartPageStr, 10) : -1;

      // Check if the requested page's chunk is the one currently stored in localStorage
      if (storedChunkData && storedChunkStartPage === requestedChunkStartPage) {
        console.log(`✅ Chunk starting at page ${storedChunkStartPage + 1} found in localStorage.`);
        const fullChunk: TradeRow[] = JSON.parse(storedChunkData);

        // Calculate the slice for the specific page within the 900-record chunk
        const pageOffsetInChunk = index - requestedChunkStartPage; // 0, 1, or 2
        const startIndex = pageOffsetInChunk * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = fullChunk.slice(startIndex, endIndex);

        setRowData(pageData); // Update grid with data from localStorage
      } else {
        // If the chunk is not in localStorage, or it's a different chunk, fetch it
        console.log(`⏳ Chunk for page ${index + 1} not in localStorage. Fetching chunk starting at page ${requestedChunkStartPage + 1}...`);
        fetchChunk(requestedChunkStartPage);
      }
    } catch (error) {
      console.error("❌ Error accessing localStorage or parsing data:", error);
      alert("Error reading cached data. Refetching from server.");
      // Fallback to fetching if there's any localStorage issue
      fetchChunk(requestedChunkStartPage);
    }
  };

  // ==============================
  // Pagination Handlers
  // ==============================
  const handleNext = () => goToPage(pageIndex + 1);
  const handlePrev = () => {
    if (pageIndex > 0) goToPage(pageIndex - 1);
  };

  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleGoToInputPage = () => {
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      goToPage(pageNum - 1); // Convert 1-based user input to 0-based pageIndex
      setInputPage(''); // Clear the input after navigating
    } else {
      alert('Please enter a valid positive page number.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToInputPage();
    }
  };

  // ==============================
  // Initial Load Effect
  // ==============================
  useEffect(() => {
    // On initial load, try to retrieve the first chunk (page 0) from localStorage
    try {
      const storedChunkData = localStorage.getItem(LOCAL_STORAGE_CHUNK_DATA_KEY);
      const storedChunkStartPageStr = localStorage.getItem(LOCAL_STORAGE_CHUNK_START_PAGE_KEY);
      const storedChunkStartPage = storedChunkStartPageStr ? parseInt(storedChunkStartPageStr, 10) : -1;

      if (storedChunkData && storedChunkStartPage === 0) {
        console.log("✅ Initial chunk (pages 0-2) found in localStorage.");
        const fullChunk: TradeRow[] = JSON.parse(storedChunkData);
        // Display the first page of the cached chunk
        setRowData(fullChunk.slice(0, pageSize));
        setPageIndex(0);
      } else {
        // If no valid chunk is in localStorage for page 0, fetch it
        console.log("⏳ Initial chunk (pages 0-2) not in localStorage or invalid. Fetching...");
        fetchChunk(0);
      }
    } catch (error) {
      console.error("❌ Error during initial localStorage load:", error);
      alert("Error loading cached data. Fetching new data from server.");
      // Fallback to fetching if there's any localStorage issue during initial load
      fetchChunk(0);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="flex flex-col h-screen w-full">
  {/* Pagination Controls */}
  <div className="flex justify-center items-center p-4 gap-2">
    <button
      onClick={handlePrev}
      disabled={pageIndex === 0}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      ⬅️ Previous
    </button>
    <span className="px-4 py-2 text-lg font-semibold">Page {pageIndex + 1}</span>
    <button
      onClick={handleNext}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Next ➡️
    </button>

    {/* Page selection input */}
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

  {/* AG Grid filling available vertical space */}
  <div className="flex-1 overflow-hidden">
    <div className="ag-theme-alpine h-full w-full">
      <AgGridReact<TradeRow>
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="normal" // Important: not autoHeight
      />
    </div>
  </div>
</div>

  );
};

export default TradeGrid;