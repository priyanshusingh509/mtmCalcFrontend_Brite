'use client';

import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';

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

interface TradeRow {
  tradeNo: number;
  symbol: string;
  name: string;
  quantity: number;
  rate: number;
  time: string;
}

const TradeGrid = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [cache, setCache] = useState<{ [key: number]: TradeRow[] }>({});

  const pageSize = 300;
  const gridRef = useRef<AgGridReact<TradeRow>>(null);

  const columnDefs: ColDef<TradeRow>[] = [
    { headerName: 'Trade No.', field: 'tradeNo' },
    { headerName: 'Symbol', field: 'symbol' },
    { headerName: 'Name', field: 'name' },
    { headerName: 'Quantity', field: 'quantity' },
    { headerName: 'Rate', field: 'rate' },
    { headerName: 'Time', field: 'time' },
  ];

  const fetchInitialData = () => {
    fetch(`http://localhost:3000/fetchmock?start=0&limit=900`)
      .then(res => res.json())
      .then(data => {
        // Slice into 0–699 and 700–1399
        const page0 = data.slice(0, 300);
        const page1 = data.slice(300, 600);
        const page2 = data.slice(600, 900);

        // Set current view
        setRowData(page0);

        // Cache pages
        setCache({
          0: page0,
          1: page1,
          2: page2,
        });
      })
      .catch(err => console.error("Fetch error:", err));
  };

  const fetchPageFromBackend = (page: number) => {
    console.log("THis was fetched from backend")
    const start = page * pageSize;
    fetch(`http://localhost:3000/fetchmock?start=${start}&limit=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setCache(prev => ({ ...prev, [page]: data }));
        setRowData(data);
      })
      .catch(err => console.error("Fetch error:", err));
  };

  const goToPage = (index: number) => {
    setPageIndex(index);
    if (cache[index]) {
      console.log("this was cached");
      setRowData(cache[index]);
    } else {
      fetchPageFromBackend(index);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleNext = () => {
    goToPage(pageIndex + 1);
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      goToPage(pageIndex - 1);
    }
  };

  const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
    sortable: true,
    filter: true,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Custom Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '1rem' }}>
        <button onClick={handlePrev} disabled={pageIndex === 0}>
          ⬅️ Previous
        </button>
        <span>Page {pageIndex + 1}</span>
        <button onClick={handleNext}>
          Next ➡️
        </button>
      </div>
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
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
