'use client';
import { useState, useEffect, RefObject } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { TradeRow } from '../types/TradeRow';

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

  useEffect(() => {
    if (!gridRef.current?.api) return;

    const colState = gridRef.current.api.getColumnState()?.map(col => {
      const colId = col.colId ?? '';
      const colDef = gridRef.current?.api.getColumnDef(colId);
      const displayName = colDef?.headerName ?? colId;
      return {
        colId,
        displayName,
        hidden: col.hide ?? false,
      };
    });

    if (colState) setColumns(colState);
  }, [gridRef.current?.api]);

  const toggleColumn = (colId: string) => {
    const newState = columns.map(col =>
      col.colId === colId ? { ...col, hidden: !col.hidden } : col
    );
    setColumns(newState);
    gridRef.current?.api.setColumnsVisible([colId], !!newState.find(c => c.colId === colId)?.hidden === false);
  };

  const saveState = () => {
    const state = gridRef.current?.api.getColumnState();
    if (state) {
      localStorage.setItem('savedColumnState', JSON.stringify(state));
      alert('Column visibility saved!');
    }
  };

  const loadState = () => {
    const saved = localStorage.getItem('savedColumnState');
    if (saved) {
      const state = JSON.parse(saved);
      gridRef.current?.api.applyColumnState({ state, applyOrder: true });

      const updated = state.map((col: any) => {
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
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Columns
      </button>
      {open && (
        <div className="absolute top-12 left-0 bg-white border shadow-lg p-4 rounded z-50 max-h-64 overflow-auto w-64">
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
              className="text-sm px-2 py-1 bg-gray-500 text-white rounded"
            >
              Load
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
