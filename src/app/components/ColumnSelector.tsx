'use client';

import { useState, useEffect, RefObject, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { TradeRow } from '../types/TradeRow';
import { useTradeData } from '../hooks/UseTradeData';
import { usePathname } from 'next/navigation';
import { stat } from 'fs';

type Props = {
  gridRef: RefObject<AgGridReact<TradeRow> | null>;
};

type ColumnMeta = {
  colId: string;
  displayName: string;
  hidden: boolean;
};

export default function ColumnSelector({ gridRef }: Props) {
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [open, setOpen] = useState(false);
  const { saveColDefs, getColDefs } = useTradeData();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const state = gridRef.current?.api.getColumnState();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const updateColumnMeta = () => {
    //console.log("updatecolumnmeta ran")
    const columnState = gridRef.current?.api.getColumnState();
    if (!columnState) return;
    
    const updated = columnState.map(col => {
      const colId = col.colId ?? '';
      const colDef = gridRef.current?.api.getColumnDef(colId);
      const displayName = colDef?.headerName ?? colId;
      return {
        colId,
        displayName,
        hidden: col.hide ?? false,
      };
    });
    
    setColumns(updated);
  };
  
  useEffect(() => {
    setTimeout(() => {
      
      if (!gridRef.current?.api) return;
      updateColumnMeta();
    }, 1000);
  }, []);
  
  const toggleColumn = (colId: string) => {
    const newState = columns.map(col =>
      col.colId === colId ? { ...col, hidden: !col.hidden } : col
    );
    setColumns(newState);
    
    const isVisible = !newState.find(c => c.colId === colId)?.hidden;
    gridRef.current?.api.setColumnsVisible([colId], isVisible);
  };
  
  const saveState = () => {
    const currentHref = pathname.split('/').filter(Boolean).pop();
    if (state && currentHref) {
      saveColDefs(state, currentHref);
      alert('Column visibility saved!');
    }
  };
  
  const loadState = async () => {
    const currentHref = pathname.split('/').filter(Boolean).pop();
    if (!currentHref) return;
    const state = await getColDefs(currentHref);
    gridRef.current?.api.applyColumnState({
      state,
      applyOrder: true,
    });
    
    updateColumnMeta();
  };
  
  const resetState = () => {
    if(state){
      gridRef.current?.api.resetColumnState();
    }
    updateColumnMeta();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="mx-1 px-4 py-2 w-[25vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer active:scale-95 transition transform duration-100"
      >
        Columns
      </button>

      {open && (
        <div className="absolute top-10 right-0 bg-white border shadow-lg p-4 rounded z-50 max-h-48 lg:max-h-64 overflow-auto w-64">
          {columns.map(col => (
            <label key={col.colId} className="block py-1">
              <input
                type="checkbox"
                checked={!col.hidden}
                onChange={() => toggleColumn(col.colId)}
                className="mr-2"
              />
              {col.displayName}
            </label>
          ))}

          <div className="mt-4 flex justify-between">
            <button
              onClick={saveState}
              className="text-sm px-2 py-1 bg-green-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={loadState}
              className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
            >
              Load
            </button>
            <button
              onClick={resetState}
              className="text-sm px-2 py-1 bg-red-500 text-white rounded"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
