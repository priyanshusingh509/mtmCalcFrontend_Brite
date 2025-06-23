'use client'

import { Dialog, DialogPanel } from '@headlessui/react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { TradeRow } from '../types/TradeRow';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTradeData } from '../hooks/UseTradeData';




type Props = {
  isOpen: boolean;
  onClose: () => void;
  field: string;
  value: string | number;
};

export default function RecordModal({ isOpen, onClose, field, value }: Props) {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  const {
  fetchRecordsByField
  } = useTradeData();

  const columnDefs: ColDef[] = [
    { headerName: 'Member ID', field: 'membr_id', minWidth: 100 },
    { headerName: 'Trader ID', field: 'trdr_id' , minWidth: 100 },
    { headerName: 'Script Code', field: 'scrp_code' , minWidth: 100 },
    { headerName: 'Script ID', field: 'scrp_id', minWidth: 100  },
    { headerName: 'Rate', field: 'rate' , minWidth: 100 },
    { headerName: 'Quantity', field: 'qty' , minWidth: 100 },
    { headerName: 'Trade Status', field: 'trd_status' , minWidth: 100 },
    { headerName: 'CM Code', field: 'cm_code', minWidth: 100  },
    { headerName: 'Time', field: 'time', minWidth: 100  },
    { headerName: 'Date', field: 'date' , minWidth: 100 },
    { headerName: 'Client ID', field: 'clnt_id', minWidth: 100  },
    { headerName: 'Order ID', field: 'ordr_id', minWidth: 100  },
    { headerName: 'Transaction Type / Order Type', field: 'trns_type' , minWidth: 100 },
    { headerName: 'Buy/Sell', field: 'bs_flag' , minWidth: 100 },
    { headerName: 'Trade ID', field: 'trade_id', minWidth: 100  },
    { headerName: 'Client Type', field: 'clnt_type', minWidth: 100  },
    { headerName: 'ISIN', field: 'isin' , minWidth: 100 },
    { headerName: 'Script Group', field: 'scrp_group' , minWidth: 100 },
    { headerName: 'Settlement No.', field: 'sett_no' , minWidth: 100 },
    { headerName: 'Order Time', field: 'ord_time' , minWidth: 100 },
    { headerName: 'AO/PO Flag', field: 'ao_po_flag' , minWidth: 100 },
    { headerName: 'Location ID', field: 'location_id' , minWidth: 100 },
    { headerName: 'Trade Modified Time', field: 'trd_mod_time', minWidth: 100  },
    { headerName: 'Session ID or Trader ID', field: 'session_id' , minWidth: 100 },
    { headerName: 'CP Code', field: 'cp_code', minWidth: 100  },
    { headerName: 'CP Code Confirmation', field: 'cp_code_confrn' , minWidth: 100 },
    { headerName: 'Old Custodian Participant', field: 'old_cust_participant' , minWidth: 100 },
    { headerName: 'Old Custodian Code', field: 'old_cust_code', minWidth: 100  }
  ];
    const gridRef = useRef(null);

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1
  };
  // const autoSizeStrategy = useMemo(() => {
  //   return {
  //     type: "fitCellContents",
  //   };
  //     }, []);

  // const autoSizeAll = useCallback((skipHeader) => {
  //   const allColumnIds = [];
  //   gridRef.current.api.getColumns().forEach((column) => {
  //     allColumnIds.push(column.getId());
  //   });
  //   gridRef.current.api.autoSizeColumns(allColumnIds, skipHeader);
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isOpen && field && value) {
          const Data = await fetchRecordsByField(field,value);
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
  <DialogPanel className="bg-white w-[95vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col">
    
    {/* Header */}
    <div className="flex justify-between items-center px-6 py-4 bg-gray-100 border-b rounded-t-2xl">
      <div className="w-full text-lg md:text-xl font-semibold text-gray-800 flex justify-center">
        <div className="text-blue-600">Trader Id: </div>
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
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="normal"

      />
    </div>

    {/* Footer (Optional) */}
    {/* <div className="px-6 py-3 bg-gray-50 border-t flex justify-end">
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Export</button>
    </div> */}
  </DialogPanel>
</Dialog>

  );
}
