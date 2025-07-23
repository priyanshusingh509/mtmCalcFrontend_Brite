'use client';

import { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, themeAlpine } from 'ag-grid-community';
import { CellDoubleClickedEvent, SortChangedEvent } from 'ag-grid-community';
import RecordModal from './RecordModal';
import CustomFilter from './CustomFilter';
import { usePathname } from 'next/navigation';
import { useTradeData } from '../hooks/UseTradeData';
import {
  ModuleRegistry,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ColumnApiModule,
  SuppressHeaderKeyboardEventParams,
  ScrollApiModule,
  RenderApiModule
} from 'ag-grid-community';
import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';
import ColumnSelector from './ColumnSelector';
import Dropdown from './Dropdown';

ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ColumnApiModule,
  ScrollApiModule,
  RenderApiModule
]);

export interface IndexType {
  current: number;
}

type TradeGridProps = {
  mobColDef: ColDef[],
  fileColDef: ColDef[];
  requestType: "table" | "aggregate";
  requestName: string;
  pageIndex: IndexType;
  summaryType?: "trader" | "symbol";
  divFactor?: number;
  setDivFactor?: Function;
  setTableUsed?: Function;
};

const divFactors = [
  { field: "Per Crore", factor: 10000000 },
  { field: "Per Lakh", factor: 100000 }
];

const tables = [
  { field: "BSE CM", value: "EQ_ITR"},
  { field: "BSE FNO", value: "EQD_ITRTM"},
  { field: "NSE CM", value: "NSE_Cash_Algo"},
  { field: "NSE FNO", value: "NSE_FNO_Algo"}
]


const TradeGrid = ({ mobColDef, fileColDef, requestType, requestName, pageIndex, summaryType, divFactor, setDivFactor, setTableUsed }: TradeGridProps) => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [inputPage, setInputPage] = useState(pageIndex.current + 1);
  const [clearSortSignal, setClearSortSignal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearSignal, setClearSignal] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const currentSortField = useRef<string>('');
  const sortOrder = useRef<'asc' | 'desc' | ''>('');
  const [currentFilterCol, setCurrentFilterCol] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState<string | null>(null);
  const [openDivDropdown, setOpenDivDropdown] = useState<string | null>(null);;
  const [goBtn, setGoBtn] = useState("");
  const [nextBtn, setNextBtn] = useState("");
  const [previousBtn, setPreviousBtn] = useState("");
  const [refreshBtn, setRefreshBtn] = useState("");
  
  // ✅ Changed from useRef to useState to trigger UI updates
  const [lastUpdated, setLastUpdated] = useState('');
  
  const gridRef = useRef<AgGridReact<TradeRow> | null>(null);
  
  const {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    getColDefs
  } = useTradeData();
  
  const handleSearch = async (requestName: string, col: string, search: string) => {
    setCurrentFilterCol(col);
    setCurrentSearch(search);
    try{
      const { total, lastUpdatedTime } = await fetchPageViaGoto(0, requestType, requestName, { current: 0}, currentSortField.current, sortOrder.current, col, search, summaryType)
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime); // ✅ Use state setter
    } catch {
      setTotalPages(0);
    }
    pageIndex.current = 0;
    setInputPage(1);
  };
  
  const gridTheme = themeAlpine.withParams({
    spacing: 2,
    accentColor: '#2196F3',
    oddRowBackgroundColor: '#00000008',
    wrapperBorderRadius: 10,
    rowBorder: true
  });
  
  const columnDefs: ColDef[] = [
    {
      headerName: 'Index',
      valueGetter: params => (pageIndex.current * PAGE_SIZE) + (params?.node?.rowIndex ?? 0) + 1,
      sortable: false,
      filter: false,
      width: 100,
      lockPosition:"left",
      headerComponent: () => <div className='font-semibold w-full flex justify-center'>Index</div>,
      cellClass: 'font-bold text-center',
    },
    ...fileColDef
  ];
  
  const defaultColDef: ColDef = {
    cellClass: 'text-center',
    resizable: true,
    filter: true,
    minWidth:120,
    headerComponent: CustomFilter,
    headerComponentParams: {
      requestName: requestName,
      onSearch: handleSearch,
      currentFilterCol,
      summaryType: summaryType,
      clearSignal,
      clearSortSignal
    },
    sortable: true,
    suppressHeaderKeyboardEvent(params: SuppressHeaderKeyboardEventParams) {
      return params.event.key === 'Enter';
    },
  };
  
  const handlePrev = async () => {
    setPreviousBtn("cursor-wait shadow-2xl");
    if (pageIndex.current === 0) return;
    
    pageIndex.current -= 1;
    setInputPage(inputPage - 1);
    const curr = pageIndex.current;
    
    const cachedPage = sessionStorage.getItem(`page-${curr}`);
    if (cachedPage) {
      const parsed = JSON.parse(cachedPage);
      setRowData(parsed.data || parsed);
      setLastUpdated(parsed.lastUpdatedTime || lastUpdated); // ✅ Use state setter
    } else {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(curr * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime); // ✅ Use state setter
    }

    keepOnlyThreePages(pageIndex);
    if (curr > 0) {
      fetchConsecutive(curr - 1, false, requestType, requestName, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    }
    setTimeout(() => setPreviousBtn(""), 70);
  };
  
  const handleNext = async () => {
    setNextBtn("cursor-wait shadow-2xl");
    if (pageIndex.current >= totalPages - 1) return;
    
    pageIndex.current += 1;
    setInputPage(inputPage + 1);
    const curr = pageIndex.current;
    
    const cachedPage = sessionStorage.getItem(`page-${curr}`);
    if (cachedPage) {
      const parsed = JSON.parse(cachedPage);
      setRowData(parsed.data || parsed);
      setLastUpdated(parsed.lastUpdatedTime || lastUpdated); // ✅ Use state setter
    } else {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(curr * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime); // ✅ Use state setter
    }
    
    keepOnlyThreePages(pageIndex);
    fetchConsecutive(curr + 1, true, requestType, requestName, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTimeout(() => setNextBtn(""), 70);
  };
  
  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(parseInt(e.target.value));
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToInputPage();
    }
  };

  const handleGoToInputPage = async () => {
    setGoBtn("cursor-wait shadow-2xl");
    const page = inputPage;
    if (isNaN(page) || page < 1 || page > totalPages) {
      alert("page does not exist");
      return;
    }
    pageIndex.current = page - 1;
    sessionStorage.clear();
    const { total, lastUpdatedTime } = await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTotalPages(total);
    setLastUpdated(lastUpdatedTime); // ✅ Use state setter
    setTimeout(() => setGoBtn(""), 150);
  };
  
  const handleRefreshPage = async () => {
    setRefreshBtn("cursor-wait shadow-2xl");
    sessionStorage.clear(); // ✅ Clear cache for a true refresh
    
    const loadInitialPage = async () => {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime); // ✅ Use state setter
    };
    
    await loadInitialPage();
    setTimeout(() => setRefreshBtn(""), 70);
  };
  
  const handleFilter = async () => {
    // sessionStorage.clear();
    const api = gridRef.current?.api;
    api?.setFilterModel(null);
    // api?.resetColumnState();
    setCurrentFilterCol(null);
    setCurrentSearch(null);
    setClearSignal(prev => prev + 1);
    setClearSortSignal(prev => prev + 1);
    currentSortField.current = '';
    sortOrder.current = '';
    const { total, lastUpdatedTime } = await fetchPageViaGoto(0, requestType, requestName, { current: 0 }, '', '', null, null, summaryType);
    setTotalPages(total);
    setLastUpdated(lastUpdatedTime); // ✅ Use state setter
  };
  
  const handleSort = async (event: SortChangedEvent<TradeRow>) => {
    const columnState = event.api.getColumnState();
    const sortedColumn = columnState.find(col => col.sort !== null);
    
    if (sortedColumn) {
      currentSortField.current = sortedColumn.colId || '';
      sortOrder.current = sortedColumn.sort as 'asc' | 'desc';
    } else {
      currentSortField.current = '';
      sortOrder.current = '';
    }
    const { total, lastUpdatedTime } = await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTotalPages(total);
    setLastUpdated(lastUpdatedTime); // ✅ Use state setter
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
  
  const onFirstDataRendered = () => {
    setLoading(false);
    const api = gridRef.current?.api;
    if (api) {
      const allColumns = api.getColumns();
      if (allColumns && allColumns.length <= 19) {
        console.log("this ran1233");
        api.autoSizeAllColumns(true);
      }
    }
  };
  
  useEffect(() => {
    sessionStorage.clear(); // ✅ Clear cache on initial mount for browser refresh
    
    const loadInitialPage = async () => {
        const { total, lastUpdatedTime } = await fetchPageViaGoto(
          pageIndex.current * PAGE_SIZE,
          requestType,
          requestName,
          pageIndex,
          currentSortField.current,
          sortOrder.current,
          currentFilterCol,
          currentSearch,
          summaryType
        );
        // setLastUpdated(lastUpdatedTime);
        setTotalPages(total);
        setLastUpdated(lastUpdatedTime);
    };
    loadInitialPage();
  }, [requestName]);
  
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : 'unset';
  }, [loading]);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  
  
  useEffect(() => {
    const applyColumnState = async () => {
      const currentHref = pathname.split("/").filter(Boolean).pop();
      const state = await getColDefs(currentHref);

      gridRef.current?.api.applyColumnState({
        state,
        applyOrder: true,
      });
    }
    applyColumnState();
    // ColumnSelector.
    
  }, [])

  return (
    <div className="pt-1 flex h-full flex-col w-full">
      {/* Pagination Controls */}
      <div className='bg-gray-200 lg:h-12 w-full grid grid-cols-3 lg:grid-cols-5 justify-around items-center border-1 border-gray-300'>
        {/* ✅ Display value directly from state */}
        <div className='flex justify-center items-center font-semibold col-span-3 lg:col-span-2'>Last Updated: {lastUpdated}</div>
        <div className='flex justify-center items-center '>
          <button
            onClick={handlePrev}
            disabled={pageIndex.current === 0}
            className={`flex justify-center items-center bg-gray-300 w-10 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${previousBtn}`}
          >
            <img src={"./prev.png"} className='h-6 w-8' alt="Previous"/>
          </button>
          <div className='flex px-4 py-2 text-lg font-semibold'>
            <input
              type="number"
              min="1"
              value={inputPage}
              onChange={handleInputPageChange}
              onKeyPress={handleKeyPress}
              className="w-12 border border-gray-300 rounded text-center"
            />
            / {totalPages}
          </div>
          <button
            onClick={handleNext}
            disabled={pageIndex.current >= (totalPages - 1)}
            className={`flex justify-center items-center bg-gray-300 w-10 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${nextBtn}`}
          >
            <img src={"./prev.png"} className='h-6 w-8 rotate-180' alt="Next"/>
          </button>
        </div>
        <div className='flex justify-center items-center m-1 col-span-2 lg:col-span-2'>
          {setTableUsed ?
            <div>
              <Dropdown 
              id='tables'
              label='Table'
              openDropdown={openDivDropdown}
              setOpenDropdown={setOpenDivDropdown}
              >
                {tables.map((table, id) => {
                        return <div key={id} className={`py-1 px-5 cursor-pointer ${table.value == requestName ? "bg-blue-500 text-white" : ""}`} onClick={()=>{
                          setTableUsed(table.value);
                          setOpenDivDropdown(null)
                        }
                      }>
                      {table.field}
                </div>
              })}
              </Dropdown>
            </div> 
            : null
          }
          {requestName == 'turnover' ?
            <div>
              <Dropdown
                id="divFactor"
                label="Div Factor"
                openDropdown={openDivDropdown}
                setOpenDropdown={setOpenDivDropdown}
              >
                {divFactors.map((factor, id) => (
                  <div
                    key={id}
                    className={`py-1 px-5 text-sm cursor-pointer hover:bg-blue-100 ${
                      factor.factor === divFactor ? "bg-blue-500 text-white" : ""
                    }`}
                    onClick={() => {
                      setDivFactor?.(factor.factor);
                      setOpenDivDropdown(null);
                    }}
                  >
                    {factor.field}
                  </div>
                ))}

              </Dropdown>
            </div> 
            : null
          }
          <button
          onClick={handleFilter}
          className={`mx-1 px-4 py-2 w-[30vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${nextBtn}`}
          >
            Clear Filter
          </button>
          <button
          className={`mx-1 px-4 py-2 w-[25vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer active:scale-95 transition transform duration-100 ${refreshBtn}`}
          onClick={handleRefreshPage}
          >
            Refresh
          </button>
          <div className='w-[25vw] md:w-[20vw] lg:w-[8vw]'>
            {gridRef.current?.api && (
              <ColumnSelector gridRef={gridRef}/>  
            )}
          </div>
        </div>
      
      </div>

      {/* AG Grid */}
      <div className={`flex flex-grow w-full`}>
        <div className={`flex flex-col ag-theme-alpine m-2 w-full relative min-h-screen lg:min-h-0`}>
          {loading && (
            <div className="absolute inset-0 bg-white z-10 bg-opacity-70 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="flex justify-center items-center gap-2 text-black animate-pulse font-bold text-3xl">
                    <img src={"logo.png"} width={"48px"} alt="Loading..."/>Algoquant
                </div>
              </div>
            </div>
          )}
          <AgGridReact<TradeRow>
            theme={gridTheme}
            ref={gridRef}
            rowData={rowData}
            columnDefs={windowWidth > 1024 ? columnDefs : mobColDef}
            key={windowWidth > 1024 ? 'desktop' : 'mobile'}
            defaultColDef={defaultColDef}
            domLayout="normal"
            onCellDoubleClicked={handleCellDoubleClick}
            onSortChanged={handleSort}
            onFirstDataRendered={onFirstDataRendered}
          />
        </div>
        {(requestType == 'table' && requestName) && <RecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          field={modalField}
          value={modalValue}
          fileColDef={fileColDef}
          defaultColDef={defaultColDef}
          requestType={requestType}
          requestName={requestName}
          gridTheme={gridTheme}
        />}
      </div>
    </div>
  );
};

export default TradeGrid;