/**
 * TradeGrid Component
 * 
 * A high-performance, feature-rich data grid component for displaying trade data.
 * Handles large datasets with server-side pagination, sorting, and filtering.
 * Supports both desktop and mobile views with responsive design.
 */

// React and core dependencies
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

// AG Grid imports
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, themeAlpine } from 'ag-grid-community';
import { CellDoubleClickedEvent, SortChangedEvent } from 'ag-grid-community';
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
  RenderApiModule,
  GridStateModule,
} from 'ag-grid-community';

// Custom components
import RecordModal from './RecordModal';
import CustomFilter from './CustomFilter';
import ColumnSelector from './ColumnSelector';
import Dropdown from './Dropdown';

// Hooks and types
import { useTradeData } from '../hooks/UseTradeData';
import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';

// Register AG Grid modules for tree-shaking
ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ColumnApiModule,
  ScrollApiModule,
  RenderApiModule,
  GridStateModule
]);

/**
 * Represents the current page index state
 */
export interface IndexType {
  current: number;
}

/**
 * Props for the TradeGrid component
 */
type TradeGridProps = {
  /** Column definitions for mobile view */
  mobColDef: ColDef[],
  /** Column definitions for desktop view */
  fileColDef: ColDef[];
  /** Type of data request (table or aggregate) */
  requestType: "table" | "aggregate";
  /** Name of the data source/endpoint */
  requestName: string;
  /** Current page index state */
  pageIndex: IndexType;
  /** Optional: Type of summary view (trader or symbol) */
  summaryType?: "trader" | "symbol";
  /** Current division factor for number formatting */
  divFactor?: number;
  /** Callback to update division factor */
  setDivFactor?: (factor: number) => void;
  /** Callback to update the active table */
  setTableUsed?: (table: string) => void;
};

/**
 * Division factors for number formatting
 * Used to display large numbers in a more readable format
 */
const divFactors = [
  { field: "Per Crore", factor: 10000000 },  // 1 crore = 10,000,000
  { field: "Per Lakh", factor: 100000 }      // 1 lakh = 100,000
];

/**
 * Available market data tables
 * Maps display names to their corresponding API values
 */
const tables = [
  { field: "BSE CM", value: "EQ_ITR" },         // BSE Cash Market
  { field: "BSE FNO", value: "EQD_ITRTM" },     // BSE Futures & Options
  { field: "NSE CM", value: "NSE_Cash_Algo" },  // NSE Cash Market
  { field: "NSE FNO", value: "NSE_FNO_Algo" }   // NSE Futures & Options
];


/*
 * TradeGrid Component
 * 
 * A high-performance data grid for displaying trade information with:
 * - Server-side pagination and sorting
 * - Custom filtering and searching
 * - Responsive design for mobile and desktop
 * - Real-time data updates
 * - Column management and customization
 * 
 * @param {TradeGridProps} props - Component properties
 * @returns {JSX.Element} The rendered TradeGrid component
 */
const TradeGrid = ({
  mobColDef,         // Column definitions for mobile view
  fileColDef,        // Column definitions for desktop view
  requestType,       // Type of data request (table/aggregate)
  requestName,       // Name of the data source/endpoint
  pageIndex,         // Current page index state
  summaryType,       // Type of summary view (trader/symbol)
  divFactor,         // Current division factor for number formatting
  setDivFactor,      // Callback to update division factor
  setTableUsed       // Callback to update active table
}: TradeGridProps) => {
  // Router and navigation
  const pathname = usePathname();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');
  
  // Pagination state
  const [inputPage, setInputPage] = useState(pageIndex.current + 1);
  const [totalPages, setTotalPages] = useState(0);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [openDivDropdown, setOpenDivDropdown] = useState<string | null>(null);
  
  // Button states (for loading/disabled states)
  const [goBtn, setGoBtn] = useState("");
  const [nextBtn, setNextBtn] = useState("");
  const [previousBtn, setPreviousBtn] = useState("");
  const [refreshBtn, setRefreshBtn] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Filter and sort state
  const [clearSortSignal, setClearSortSignal] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const currentSortField = useRef<string>('');
  const sortOrder = useRef<'asc' | 'desc' | ''>('');
  const [currentFilterCol, setCurrentFilterCol] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState<string | null>(null);
  
  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Refs for AG Grid
  const gridRef = useRef<AgGridReact<TradeRow> | null>(null);
  const gridColumnState = useRef<any[]>([]);
  
  // Custom hook for data management
  const {
    rowData,
    setRowData,
    fetchPageViaGoto,    // Fetches a specific page of data
    fetchConsecutive,    // Fetches consecutive pages for pagination
    keepOnlyThreePages,  // Optimizes memory usage
    getColDefs          // Gets column definitions
  } = useTradeData();
  
  /**
   * Handles search functionality for the data grid
   * @param {string} requestName - The name of the request/endpoint
   * @param {string} col - The column to filter on
   * @param {string} search - The search term
   */
  const handleSearch = useCallback(async (requestName: string, col: string, search: string) => {
    // Update filter state
    setCurrentFilterCol(col);
    setCurrentSearch(search);
    
    try {
      // Fetch first page with the applied filter
      const { total, lastUpdatedTime } = await fetchPageViaGoto(
        0,                          // Start from first page
        requestType,               // Table or aggregate request
        requestName,               // Endpoint name
        { current: 0 },            // Reset page index
        currentSortField.current,  // Current sort field
        sortOrder.current,         // Current sort order
        col,                       // Column to filter on
        search,                    // Search term
        summaryType                // Optional summary type
      );
      
      // Update pagination and last updated time
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime);
    } catch (error) {
      console.error('Search failed:', error);
      setTotalPages(0);
    }
    
    // Reset to first page
    pageIndex.current = 0;
    setInputPage(1);
  }, [fetchPageViaGoto, requestType, summaryType]);
  
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
  
  const defaultColDef = useMemo<ColDef>(() => ({
    cellClass: 'text-center',
    resizable: true,
    filter: true,
    minWidth: 120,
    headerComponent: CustomFilter,
    headerComponentParams: {
      requestName: requestName,
      onSearch: handleSearch, // Uses the stable function
      currentFilterCol,
      summaryType: summaryType,
      clearSignal,
      clearSortSignal
    },
    sortable: true,
    suppressHeaderKeyboardEvent(params: SuppressHeaderKeyboardEventParams) {
      return params.event.key === 'Enter';
    },
  }), [requestName, handleSearch, currentFilterCol, summaryType, clearSignal, clearSortSignal]);
  
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
    setRefreshBtn("shadow-2xl transition rotate-360 transform duration-500");
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
    const api = gridRef.current?.api;
    api?.setFilterModel(null);
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
    // setTotalPages(total);
    // setLastUpdated(lastUpdatedTime); // ✅ Use state setter
  };

  const saveState = () => {
      const columnState = gridRef.current?.api?.getColumnState();
      if (columnState) {
        gridColumnState.current = columnState;
      };
  };

  // Load column state
  const loadState = () => {
      if(gridColumnState.current != null){
        if (gridColumnState.current.length > 0) {
          gridRef.current?.api?.applyColumnState({
            state: gridColumnState.current,
            applyOrder: true,
          });
        }
      }
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
        api.autoSizeAllColumns(true);
      }
    }
  };

  const onAutoRefresh = (checked: boolean) => {
    setAutoRefresh(checked); // ✅ triggers UI update
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
        setTotalPages(total);
        setLastUpdated(lastUpdatedTime);
    };
    loadInitialPage();
  }, [requestName]);
  
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
      gridColumnState.current =  state;
    }
      applyColumnState();
  },[TradeGrid])


  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval = setInterval(() => {
      handleRefreshPage();
    }, 10000);

    // Cleanup: runs when autoRefresh changes or component unmounts
    return () => {
      clearInterval(refreshInterval);
    };  
  }, [autoRefresh]);

  

  return (
    <div className="pt-1 flex h-full flex-col w-full">
      {/* Pagination Controls */}
      <div className='bg-gray-200 lg:h-12 w-full grid grid-cols-3 lg:grid-cols-5 justify-around items-center border-1 border-gray-300'>
        {/* ✅ Display value directly from state */}
        <div className='flex justify-center items-center gap-4 font-semibold col-span-3 lg:col-span-2'>
          <label htmlFor="auto-refresh" className="flex items-center gap-2 text-sm font-medium">
           <input
              id="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
              Auto-refresh
          </label>
          <span className="text-sm">Last Updated: {lastUpdated}</span>
        </div>

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
                          setOpenDivDropdown(null);
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
          <div className='w-[25vw] md:w-[20vw] lg:w-[8vw]'>
            {gridRef.current?.api && (
              <ColumnSelector gridRef={gridRef}/>  
            )}
          </div>
          <button
            className={`${refreshBtn} mx-2`}
            onClick={handleRefreshPage}
          >
            <img
              src={'refresh.png'}
              alt="Refresh"
              className="w-5 h-5 object-contain transition"
            />
          </button>
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
            blockLoadDebounceMillis={1000}
            debounceVerticalScrollbar={true}
            rowBuffer={0}
            enableCellTextSelection={true}
            onDragStopped={saveState}
            onPaginationChanged={loadState}
            suppressColumnMoveAnimation={true}
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