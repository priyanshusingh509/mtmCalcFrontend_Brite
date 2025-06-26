'use client';

import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import type { CellDoubleClickedEvent, SortChangedEvent } from 'ag-grid-community';
import RecordModal from './RecordModal';


import { useTradeData } from '../hooks/UseTradeData';


import {
  ModuleRegistry,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ColumnApiModule
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ColumnApiModule 
]);

import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';

export interface IndexType{
  current: number;
}

type TradeGridProps = {
  fileColDef: ColDef[];
  tableName: string;
  pageIndex: IndexType;
};



const TradeGrid = ({ fileColDef, tableName, pageIndex }: TradeGridProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [inputPage, setInputPage] = useState('');
  // const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const sortField= useRef<string>(''); // default: empty string
  const sortOrder= useRef<'asc' | 'desc' | ''>(''); // default: empty string


  const gridRef = useRef(null);
  const {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    // pageIndex, // 👈 bring it from the hook directly
    fetchTotalRecords,
    fetchRecordsByField
  } = useTradeData();

  const columnDefs: ColDef[] = [
  {
    headerName: 'Index',
    valueGetter: params => (pageIndex.current*PAGE_SIZE) + (params?.node?.rowIndex ?? 0) + 1,
    sortable: false,
    filter: false,
    width: 100,
    headerClass: "font-bold text-center",
    cellClass: 'font-bold text-center'
  },
  ...fileColDef
];

  const defaultColDef: ColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    width: 180
  };

  const handlePrev = () => {
    setPreviousBtn("cursor-wait shadow-2xl");
    if (pageIndex.current === 0) return;

    pageIndex.current -= 1;
    const curr = pageIndex.current;
    const prev = curr - 1;  

    const currentCached = localStorage.getItem(`page-${curr}`);
    if (currentCached) {
      setRowData(JSON.parse(currentCached));
    }

    keepOnlyThreePages(pageIndex);
    fetchConsecutive(prev, false, tableName, sortField.current, sortOrder.current);
    setTimeout(()=>{
      setPreviousBtn("");
    }, 70)
    // if (!localStorage.getItem(`page-${prev}`) && curr > 0) {
    // }
    // if (!localStorage.getItem(`page-${next}`)) {
    //   fetchConsecutive(curr+1, true);
    // }
  };

  const handleNext = () => {
    setNextBtn("cursor-wait shadow-2xl");
    pageIndex.current += 1;
    const curr = pageIndex.current;
    const next = curr + 1;

    const currentCached = localStorage.getItem(`page-${curr}`);
    if (currentCached) {
      setRowData(JSON.parse(currentCached));
    }

    keepOnlyThreePages(pageIndex);

    fetchConsecutive(next, true, tableName, sortField.current, sortOrder.current);
    // if (!localStorage.getItem(`page-${next}`)) {
    // }
    // if (!localStorage.getItem(`page-${prev}`) && curr > 0) {
    //   fetchConsecutive(curr+1, false);
    // }
    setTimeout(()=>{
      setNextBtn("");
    }, 70);
  };

  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToInputPage();
    }
  };

  const handleGoToInputPage = () => {
    setGoBtn("cursor-wait shadow-2xl");
    const page = parseInt(inputPage);
    if (isNaN(page) || page < 1 || page>totalPages){
      alert("page does not exist");

      return;
    } 
    pageIndex.current = page - 1;
    // localStorage.clear();   // reset everything
    fetchPageViaGoto(pageIndex.current * PAGE_SIZE, tableName, pageIndex, sortField.current, sortOrder.current);
    setTimeout(()=>{
      setGoBtn("");
    }, 150);
  };

  const handleRefreshPage = () => {
    setRefreshBtn("cursor-wait shadow-2xl");
    fetchPageViaGoto(pageIndex.current * PAGE_SIZE, tableName, pageIndex, sortField.current, sortOrder.current);
    const loadinitialpage = async () => {
      const {total, lastUpdatedTime} = await fetchTotalRecords(tableName);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime);
    }
    loadinitialpage();
    // setRefreshBtn("");
    setTimeout(()=>{
      setRefreshBtn("");
    },70)
  }
  
  const handleSort = (event: SortChangedEvent<TradeRow>) => {
    const columnState = event.api.getColumnState();
    const sortedColumn = columnState.find(col => col.sort !== null);

    if (sortedColumn) {
      // setSortField(sortedColumn.colId || '');
      sortField.current = sortedColumn.colId || '';
      // setSortOrder(sortedColumn.sort as 'asc' | 'desc');
      sortOrder.current = sortedColumn.sort as 'asc' | 'desc';
      // Optional: immediately refetch data
      // fetchPageViaGoto(pageIndex.current * PAGE_SIZE, sortedColumn.colId, sortedColumn.sort);
    } else {
      // setSortField('');
      sortField.current = '';
      // setSortOrder('');
      sortOrder.current = '';
    }
    fetchPageViaGoto(pageIndex.current * PAGE_SIZE, tableName, pageIndex, sortField.current, sortOrder.current);
  };




  const handleCellDoubleClick = (event: CellDoubleClickedEvent<TradeRow>) => {
    const clickedField = event.colDef.field;
    const clickedValue = event.value;
    if (clickedValue && clickedField) {
      setModalField(clickedField);
      setModalValue(clickedValue);
      setIsModalOpen(true);
    }
  };
  const [goBtn, setGoBtn] = useState("");
  const [nextBtn, setNextBtn] = useState("");
  const [previousBtn, setPreviousBtn] = useState("");
  const [refreshBtn, setRefreshBtn] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>();

  useEffect(() => {
    const loadinitialpage = async () => {
      const {total, lastUpdatedTime} = await fetchTotalRecords(tableName);
      setTotalPages(total);
      fetchPageViaGoto(pageIndex.current * PAGE_SIZE, tableName, pageIndex, sortField.current, sortOrder.current);
      setLastUpdated(lastUpdatedTime);
    }
    loadinitialpage();
  }, []);


  // console.log("this should work ",totalPages);

  return (
    <div className="flex flex-col h-[90vh] w-full">
      {/* Pagination Controls */}
      <div className="flex justify-center items-center p-4 gap-2">
        <div className='font-semibold'>Last Updated: {lastUpdated}</div>
        <button
          onClick={handlePrev}
          disabled={pageIndex.current === 0}
          className={`px-4 py-2 w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${previousBtn}`}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-lg font-semibold">
          Page {pageIndex.current + 1} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={pageIndex.current === (totalPages - 1)}
          className={`px-4 py-2 w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${nextBtn}`}
        >
          Next
        </button>

        <input
          type="number"
          min="1"
          value={inputPage}
          onChange={handleInputPageChange}
          onKeyPress={handleKeyPress}
          placeholder="Search"
          className="ml-4 p-2 w-[10vw] border border-gray-300 rounded text-center"
        />
        <button
          onClick={handleGoToInputPage}
          className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:scale-95 transition transform duration-100 ${goBtn}`}
        >
          Go
        </button>
        <button
        className={`px-4 py-2 w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer active:scale-95 transition transform duration-100 ${refreshBtn}`}
        onClick={handleRefreshPage}
        >
          Refresh
        </button>
      </div>

      {/* AG Grid */}
      <div className="flex h-full">
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact<TradeRow>
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="normal"
            onCellDoubleClicked={handleCellDoubleClick}
            onSortChanged={handleSort}
          />
        </div>
        <RecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          field={modalField}
          value={modalValue}
          fileColDef={fileColDef}
          tableName={tableName}
        />

      </div>
      
      
    </div>
  );
};

export default TradeGrid;
