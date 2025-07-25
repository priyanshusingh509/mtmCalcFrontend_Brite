'use client';

import { Dialog, DialogPanel } from '@headlessui/react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, Theme, ThemeDefaultParams } from 'ag-grid-community';
import type { TradeRow } from '../types/TradeRow';
import { useEffect, useRef, useState } from 'react';
import { useTradeData } from '../hooks/UseTradeData';
import { ModuleRegistry, ColumnAutoSizeModule } from 'ag-grid-community';

// Register the required AG-Grid modules
ModuleRegistry.registerModules([ColumnAutoSizeModule]);

/**
 * Defines the props for the RecordModal component.
 */
type Props = {
  isOpen: boolean; // Controls the visibility of the modal
  onClose: () => void; // Function to close the modal
  field: string; // The field to filter records by (e.g., 'clnt_id')
  value: string | number; // The value of the field to filter by
  fileColDef: ColDef[]; // Column definitions from the parent page grid
  defaultColDef: ColDef<TradeRow>; // Default column definitions for the grids
  requestType: string; // Type of request (unused in this component)
  requestName: string; // Name of the request for data fetching
  gridTheme: Theme;
};

/**
 * A modal component to display detailed records related to a specific field and value.
 * It contains two grids: a summary grid and a detailed trade grid.
 */
export default function RecordModal({ isOpen, onClose, field, value, fileColDef, defaultColDef, requestName, gridTheme }: Props) {
  // State for the data of the two grids
  const [summaryData, setSummaryData] = useState<TradeRow[]>([]);
  const [tradeData, setTradeData] = useState<TradeRow[]>([]);
  
  // Custom hook for fetching trade data
  const { fetchRecordsByField } = useTradeData();

  // Ref for the grid API
  const gridRef = useRef<null>(null);

  // Static column definition for the index column
  const indexColDef: ColDef = {
    headerName: 'Index',
    valueGetter: (params) => (params?.node?.rowIndex ?? 0) + 1,
    sortable: false,
    filter: false,
    cellClass: 'font-bold text-center',
  };

  /**
   * Generates column definitions for the summary and trade grids dynamically.
   * @param {boolean} firstGridCheck - True for the summary grid, false for the trade grid.
   * @returns {ColDef[]} An array of column definitions.
   */
  const getColDef = (firstGridCheck: boolean): ColDef[] => {
    const changeCol = firstGridCheck
      ? { headerName: 'Script ID', field: 'scrp_id' }
      : { headerName: 'Client ID', field: 'clnt_id' };

    // The order of columns is preserved here as requested.
    const columnDefs: ColDef[] = [
      indexColDef,
      changeCol,
      { headerName: 'Script Code', field: 'scrp_code' },
      { headerName: 'Net Qty', field: 'netQty' },
      { headerName: 'Realised PnL', field: 'realisedPnL' },
      { headerName: 'Unrealised PnL', field: 'unrealisedPnL' },
      { headerName: 'Net Position', field: 'netPosition' },
      { headerName: 'MTM', field: 'MTM' },
    ];

    return columnDefs;
  };

  // Effect to fetch data when the modal is opened or the filter criteria change.
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isOpen && field && value) {
          const { firstGrid, secondGrid } = await fetchRecordsByField(field, value, 'table', requestName);
          setSummaryData(firstGrid);
          setTradeData(secondGrid);
        }
      } catch (error) {
        console.error('Error while fetching records:', error);
      }
    };

    fetchData();
  }, [isOpen, field, value]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="bg-white w-full mx-10 h-[93vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden space-y-2">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b rounded-t-2xl">
          <div className="w-full text-lg md:text-xl font-semibold text-gray-800 flex justify-center">
            <div className="text-blue-600 mx-2">
              {/* Display the header name of the filtered field */}
              {fileColDef.find((col) => col.field === field)?.headerName}:
            </div>
            <div className="font-mono">{value}</div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-all"
          >
            Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Summary Grid: Conditionally rendered if there is trade data */}
          {tradeData.length > 0 && (
            <div className="ag-theme-alpine max-h-[25%] overflow-auto px-4">
              <AgGridReact<TradeRow>
                ref={gridRef}
                rowData={summaryData}
                columnDefs={getColDef(true)}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                theme={gridTheme}
              />
            </div>
          )}

          {/* Trade Grid: Displays trade data or summary data as a fallback */}
          <div className="ag-theme-alpine flex-grow overflow-auto px-4 py-2">
            <AgGridReact<TradeRow>
              ref={gridRef}
              rowData={tradeData.length > 0 ? tradeData : summaryData}
              columnDefs={
                tradeData.length > 0
                  ? getColDef(false).filter((col) => col.field !== field) // Show trade columns
                  : [indexColDef, ...fileColDef] // Show parent grid's columns
              }
              defaultColDef={defaultColDef}
              theme={gridTheme}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}

