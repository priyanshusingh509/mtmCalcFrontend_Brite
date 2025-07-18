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

  const updateColumnMeta = () => {
    const colState = gridRef.current?.api.getColumnState()?.map(col => {
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
  };

  useEffect(() => {
    if (!gridRef.current?.api) return;
    updateColumnMeta();
  }, [gridRef.current?.api]);

  const toggleColumn = (colId: string) => {
    const newState = columns.map(col =>
      col.colId === colId ? { ...col, hidden: !col.hidden } : col
    );
    setColumns(newState);

    const newHidden = !newState.find(c => c.colId === colId)?.hidden;
    gridRef.current?.api.setColumnsVisible([colId], newHidden);
  };

  const saveState = () => {
    const state = gridRef.current?.api.getColumnState();
    if (state) {
      sessionStorage.setItem('savedColumnState', JSON.stringify(state));
      alert('Column visibility saved!');
    }
  };

  const resetState = () => {
    gridRef.current?.api.resetColumnState();
    updateColumnMeta();
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 bg-blue-500 text-white rounded w-full"
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
