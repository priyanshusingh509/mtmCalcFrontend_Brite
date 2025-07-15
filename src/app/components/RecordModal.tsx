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
  const [summaryData, setsummaryData] = useState<TradeRow[]>([]);
  const [tradeData, settradeData] = useState<TradeRow[]>([]);
  const {
  fetchRecordsByField
  } = useTradeData();
  
  const getColDef = (firstGridCheck : boolean) => {
    const changeCol = firstGridCheck ? { headerName: 'Script ID', field: 'scrp_id' } : { headerName: 'client ID', field: 'clnt_id' };
    const columnDefs: ColDef[] = [
    {
      headerName: 'Index',
      valueGetter: params => (params?.node?.rowIndex ?? 0) + 1,
      sortable: false,
      filter: false,
      cellClass: 'font-bold text-center'
    },
    changeCol,
    { headerName: 'Script Code', field: 'scrp_code'},
    { headerName: "Net Qty", field: "netQty"},
    { headerName: "Realised PnL", field: "realisedPnL"},
    { headerName: "Unrealised PnL", field: "unrealisedPnL"},
    { headerName: "Net Position", field: "netPosition"},
    { headerName: "MTM", field: "MTM"},

    ];

    return columnDefs;
  }

  const gridRef = useRef<null>(null);
  const defaultColDef: ColDef = {
    sortable: true,
    filter: true, 
    resizable: true,
    minWidth: 120,
    flex: 1,
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      if (isOpen && field && value) {
        const { firstGrid, secondGrid } = await fetchRecordsByField(field, value, tableName);
        setsummaryData(firstGrid);
        settradeData(secondGrid);
      }
    } catch (error) {
      console.log("error while fetching : ", error);
    }
  };

  fetchData();
}, [isOpen, field, value]);

  return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0,0,0,0.6)]"
      >
        <div className="bg-white w-full mx-10 h-[93vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden space-y-2">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b rounded-t-2xl">
            <div className="w-full text-lg md:text-xl font-semibold text-gray-800 flex justify-center">
              <div className="text-blue-600 mx-2">
                {fileColDef.find(col => col.field === field)?.headerName}:
              </div>
              <div className="font-mono">{value}</div>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-all"
            >
              Close
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col flex-grow overflow-hidden">
            
            {/* Summary Grid */}
            {tradeData.length > 0 && (
              <div className="ag-theme-alpine max-h-[25%] overflow-auto px-4">
                <AgGridReact<TradeRow>
                  ref={gridRef}
                  rowData={summaryData}
                  columnDefs={getColDef(true)}
                  defaultColDef={defaultColDef}
                  domLayout='autoHeight'
                />
              </div>
            )
            }


            {/* Trade Grid */}
              <div className="ag-theme-alpine flex-grow overflow-auto px-4 py-2">   
                    <AgGridReact<TradeRow>
                      ref={gridRef}
                      rowData={tradeData.length > 0 ? tradeData : summaryData}
                      columnDefs={
                        tradeData.length > 0
                        ? getColDef(false).filter(col => col.field !== field)
                        : fileColDef
                      }
                      defaultColDef={defaultColDef}
                      />
              </div>
          </div>
        </div>
      </Dialog>


  );
}
