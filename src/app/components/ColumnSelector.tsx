'use client';

// Import necessary hooks, components, and types
import { useState, useEffect, RefObject, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { TradeRow } from '../types/TradeRow';
import { useTradeData } from '../hooks/UseTradeData';
import { usePathname } from 'next/navigation';

// Define the props for the ColumnSelector component
type Props = {
  gridRef: RefObject<AgGridReact<TradeRow> | null>; // Reference to the Ag-Grid instance
};

// Define the structure for column metadata
type ColumnMeta = {
  colId: string; // Unique column identifier
  displayName: string; // User-friendly name for the column
  hidden: boolean; // Visibility state of the column
};

/**
 * ColumnSelector component provides a dropdown menu to control the visibility of columns in an Ag-Grid table.
 * It also allows saving, loading, and resetting the column visibility state.
 */
export default function ColumnSelector({ gridRef }: Props) {
  // State to hold the metadata of all columns
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  // State to control the visibility of the dropdown menu
  const [open, setOpen] = useState(false);

  // Custom hook to handle saving and retrieving column definitions
  const { saveColDefs, getColDefs } = useTradeData();
  // Hook to get the current URL pathname, used for saving state against a specific page
  const pathname = usePathname();
  // Ref for the dropdown element to detect outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Updates the component's state with the current column metadata from the grid.
   */
  const updateColumnMeta = () => {
    const columnState = gridRef.current?.api.getColumnState();
    if (!columnState) return;

    const updated = columnState.map((col) => {
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

  // Effect to initialize the column metadata after the grid is ready.
  // A timeout is used to ensure the grid API is available.
  useEffect(() => {
    setTimeout(() => {
      if (!gridRef.current?.api) return;
      updateColumnMeta();
    }, 1000);
  }, []);

  /**
   * Toggles the visibility of a specific column.
   * @param {string} colId - The ID of the column to toggle.
   */
  const toggleColumn = (colId: string) => {
    const newState = columns.map((col) =>
      col.colId === colId ? { ...col, hidden: !col.hidden } : col
    );
    setColumns(newState);

    const isVisible = !newState.find((c) => c.colId === colId)?.hidden;
    gridRef.current?.api.setColumnsVisible([colId], isVisible);
  };

  /**
   * Saves the current column visibility state to persistent storage.
   */
  const saveState = () => {
    const state = gridRef.current?.api.getColumnState();
    const currentHref = pathname.split('/').filter(Boolean).pop();
    if (state && currentHref) {
      saveColDefs(state, currentHref);
      alert('Column visibility saved!');
    }
  };

  /**
   * Loads the column visibility state from persistent storage and applies it to the grid.
   */
  const loadState = async () => {
    const currentHref = pathname.split('/').filter(Boolean).pop();
    if (!currentHref) return;
    const state = await getColDefs(currentHref);
    if (state) {
      gridRef.current?.api.applyColumnState({
        state,
        applyOrder: true,
      });
    }
    updateColumnMeta();
  };

  /**
   * Resets the column visibility to its default state.
   */
  const resetState = () => {
    gridRef.current?.api.resetColumnState();
    updateColumnMeta();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Button to toggle the column selector dropdown */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="mx-1 px-4 py-2 w-[25vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer active:scale-95 transition transform duration-100"
      >
        Columns
      </button>

      {/* Dropdown menu for column selection */}
      {open && (
        <div className="absolute top-10 right-0 bg-white border shadow-lg p-4 rounded z-50 max-h-48 lg:max-h-64 overflow-auto w-64">
          {/* List of columns with checkboxes */}
          {columns.map((col) => (
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

          {/* Action buttons for saving, loading, and resetting state */}
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
