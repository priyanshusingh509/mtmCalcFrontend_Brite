'use client'

import { Dialog, DialogPanel } from '@headlessui/react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import type { TradeRow } from '../types/TradeRow';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTradeData } from '../hooks/UseTradeData';

import { ModuleRegistry, ColumnAutoSizeModule } from 'ag-grid-community'; 

ModuleRegistry.registerModules([ ColumnAutoSizeModule ]); 

type Props = {
  isOpen: boolean;
  onClose: () => void;
  field: string;
  value: string | number;
  fileColDef: ColDef[];
  tableName: string;
};

export default function RecordModal({ isOpen, onClose, field, value, fileColDef, tableName }: Props) {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  const {
  fetchRecordsByField
  } = useTradeData();

  const columnDefs: ColDef[] = [
    {
      headerName: 'Index',
      valueGetter: params => (params?.node?.rowIndex ?? 0) + 1,
      sortable: false,
      filter: false,
      maxWidth: 100,
      cellClass: 'font-bold text-center'
    },
    ...fileColDef
  ];
    const gridRef = useRef<null>(null);

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 180,
    flex: 1,
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isOpen && field && value) {
          const Data = await fetchRecordsByField(field,value, tableName);
          setRowData(Data);
        }
      }catch(error){
        console.log("error while fetching : ",error)
      }
    }

    fetchData();
  }, [isOpen, field, value]);
  return (
<Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0,0,0,0.6)]">
  <div className="bg-white w-[95vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col">
    
    {/* Header */}
    <div className="flex justify-between items-center px-6 py-4 bg-gray-100 border-b rounded-t-2xl">
      <div className="w-full text-lg md:text-xl font-semibold text-gray-800 flex justify-center">
        <div className="text-blue-600 mx-2">{columnDefs.find(col => col.field === field)?.headerName}:</div>
        <div className="font-mono">{value}</div>
      </div>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-all"
      >
        Close
      </button>
    </div>

    {/* Grid Container */}
    <div className="ag-theme-alpine flex-1 px-4 py-2">
      <AgGridReact<TradeRow>
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs.filter(cols=> cols.field != field)}
        defaultColDef={defaultColDef}
        domLayout="normal"

      />
    </div>

    {/* Footer (Optional) */}
    {/* <div className="px-6 py-3 bg-gray-50 border-t flex justify-end">
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Export</button>
    </div> */}
  </div>
</Dialog>

  );
}
