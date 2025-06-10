'use client';

import { useEffect, useState } from 'react';
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
  tradeNo: string;
  symbol: string;
  name: string;
  quantity: number;
  rate: number;
  time: string;
}

const TradeGrid = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);

  const columnDefs: ColDef<TradeRow>[] = [
    { headerName: 'Trade No.', field: 'tradeNo' },
    { headerName: 'Symbol', field: 'symbol' },
    { headerName: 'Name', field: 'name' },
    { headerName: 'Quantity', field: 'quantity' },
    { headerName: 'Rate', field: 'rate' },
    { headerName: 'Time', field: 'time' },
  ];

  useEffect(() => {
    fetch('http://localhost:3000/fetchmock')
      .then(res => res.json())
      .then(data => setRowData(data));
  }, []);



  const defaultColDef: ColDef = {
    flex: 1, // Columns will resize to fit the available width
    minWidth: 150,
    resizable: true, // Allow column resizing
    sortable: true, // Allow sorting
    filter: true, // Enable filtering on all columns by default
  };

  return (
    // The AG Grid component container, with the 'alpine' theme.
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <AgGridReact<TradeRow>
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
      />
    </div>
  );
};

export default TradeGrid;
