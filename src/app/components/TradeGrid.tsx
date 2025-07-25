'use client';

// React and Next.js imports
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

// AG-Grid imports
import { AgGridReact } from 'ag-grid-react';
import { 
  ColDef, 
  GridApi, 
  themeAlpine, 
  CellDoubleClickedEvent, 
  SortChangedEvent, 
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
  GridStateModule 
} from 'ag-grid-community';

// Custom components and hooks
import RecordModal from './RecordModal';
import CustomFilter from './CustomFilter';
import { useTradeData } from '../hooks/UseTradeData';
import ColumnSelector from './ColumnSelector';
import Dropdown from './Dropdown';

// Type definitions and constants
import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';

// Register required AG-Grid modules
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

// Interface for the page index reference
export interface IndexType {
  current: number;
}

// Props for the TradeGrid component
type TradeGridProps = {
  mobColDef: ColDef[]; // Column definitions for mobile view
  fileColDef: ColDef[]; // Column definitions for desktop view
  requestType: "table" | "aggregate"; // Type of data request
  requestName: string; // Name of the specific data request
  pageIndex: IndexType; // Reference to the current page index
  summaryType?: "trader" | "symbol"; // Optional summary type for aggregation
  divFactor?: number; // Optional division factor for displaying values
  setDivFactor?: Function; // Optional function to set the division factor
  setTableUsed?: Function; // Optional function to set the table used
};

// Constants for division factors
const divFactors = [
  { field: "Per Crore", factor: 10000000 },  // 1 crore = 10,000,000
  { field: "Per Lakh", factor: 100000 }      // 1 lakh = 100,000
];

// Constants for table selection
const tables = [
  { field: "BSE CM", value: "BSE_Cash"},
  { field: "BSE FNO", value: "BSE_FNO"},
  { field: "NSE CM", value: "NSE_Cash"},
  { field: "NSE FNO", value: "NSE_FNO"}
]

/**
 * TradeGrid component for displaying and managing trade data with AG-Grid.
 * Features include pagination, sorting, filtering, column selection, and responsive layouts.
 */
const TradeGrid = ({ mobColDef, fileColDef, requestType, requestName, pageIndex, summaryType, divFactor, setDivFactor, setTableUsed }: TradeGridProps) => {
  const pathname = usePathname();

  // State for modal visibility and data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');

  // State for pagination and UI controls
  const [inputPage, setInputPage] = useState(pageIndex.current + 1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // State for UI button states
  const [goBtn, setGoBtn] = useState("");
  const [nextBtn, setNextBtn] = useState("");
  const [previousBtn, setPreviousBtn] = useState("");
  const [refreshBtn, setRefreshBtn] = useState("");

  // State for filtering and sorting
  const [clearSortSignal, setClearSortSignal] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const currentSortField = useRef<string>('');
  const sortOrder = useRef<'asc' | 'desc' | ''>('');
  const [currentFilterCol, setCurrentFilterCol] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState<string | null>(null);

  // State for responsive design and dropdowns
  const [windowWidth, setWindowWidth] = useState(0);
  const [openDivDropdown, setOpenDivDropdown] = useState<string | null>(null);

  // AG-Grid references
  const gridRef = useRef<AgGridReact<TradeRow> | null>(null);
  const gridColumnState = useRef<any[]>([]);

  // Custom hook for data fetching and management
  const {
    rowData,
    setRowData,
    fetchPageViaGoto,    // Fetches a specific page of data
    fetchConsecutive,    // Fetches consecutive pages for pagination
    keepOnlyThreePages,  // Optimizes memory usage
    getColDefs          // Gets column definitions
  } = useTradeData();

  /**
   * Handles search/filter actions from the custom header component.
   */
  const handleSearch = useCallback(async (requestName: string, col: string, search: string) => {
    setCurrentFilterCol(col);
    setCurrentSearch(search);
    try {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(0, requestType, requestName, { current: 0 }, currentSortField.current, sortOrder.current, col, search, summaryType);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime);
    } catch {
      setTotalPages(0);
    }
    pageIndex.current = 0;
    setInputPage(1);
  }, [fetchPageViaGoto, requestType, summaryType]);

  // Custom AG-Grid theme configuration
  const gridTheme = themeAlpine.withParams({
    spacing: 2,
    accentColor: '#2196F3',
    oddRowBackgroundColor: '#00000008',
    wrapperBorderRadius: 10,
    rowBorder: true
  });

  // Column definitions for the grid, including a dynamic index column
  const columnDefs: ColDef[] = [
    {
      headerName: 'Index',
      valueGetter: params => (pageIndex.current * PAGE_SIZE) + (params?.node?.rowIndex ?? 0) + 1,
      sortable: false,
      filter: false,
      width: 100,
      lockPosition: "left",
      headerComponent: () => <div className='font-semibold w-full flex justify-center'>Index</div>,
      cellClass: 'font-bold text-center',
    },
    ...fileColDef
  ];

  // Default column definitions for all columns
  const defaultColDef = useMemo<ColDef>(() => ({
    cellClass: 'text-center',
    resizable: true,
    filter: true,
    minWidth: 120,
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
  }), [requestName, handleSearch, currentFilterCol, summaryType, clearSignal, clearSortSignal]);

  /**
   * Handles pagination to the previous page.
   */
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
      setLastUpdated(parsed.lastUpdatedTime || lastUpdated);
    } else {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(curr * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime);
    }

    keepOnlyThreePages(pageIndex);
    if (curr > 0) {
      fetchConsecutive(curr - 1, false, requestType, requestName, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    }
    setTimeout(() => setPreviousBtn(""), 70);
  };

  /**
   * Handles pagination to the next page.
   */
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
      setLastUpdated(parsed.lastUpdatedTime || lastUpdated);
    } else {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(curr * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime);
    }

    keepOnlyThreePages(pageIndex);
    fetchConsecutive(curr + 1, true, requestType, requestName, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTimeout(() => setNextBtn(""), 70);
  };

  /**
   * Handles changes to the page input field.
   */
  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(parseInt(e.target.value));
  };

  /**
   * Handles the Enter key press in the page input field to navigate to the page.
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToInputPage();
    }
  };

  /**
   * Navigates to the specified page number.
   */
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
    setLastUpdated(lastUpdatedTime);
    setTimeout(() => setGoBtn(""), 150);
  };

  /**
   * Refreshes the data on the current page.
   */
  const handleRefreshPage = async () => {
    setRefreshBtn("shadow-2xl transition rotate-360 transform duration-500");
    sessionStorage.clear();

    const loadInitialPage = async () => {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
      setTotalPages(total);
      setLastUpdated(lastUpdatedTime);
    };

    await loadInitialPage();
    setTimeout(() => setRefreshBtn(""), 70);
  };

  /**
   * Clears all active filters and resets the grid.
   */
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
    setLastUpdated(lastUpdatedTime);
  };

  /**
   * Handles sort changes and fetches sorted data.
   */
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
    await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, requestType, requestName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
  };

  /**
   * Saves the current column state (e.g., order, width) to a ref.
   */
  const saveState = () => {
    const columnState = gridRef.current?.api?.getColumnState();
    if (columnState) {
      gridColumnState.current = columnState;
    }
  };

  /**
   * Loads and applies the saved column state to the grid.
   */
  const loadState = () => {
    if (gridColumnState.current != null) {
      if (gridColumnState.current.length > 0) {
        gridRef.current?.api?.applyColumnState({
          state: gridColumnState.current,
          applyOrder: true,
        });
      }
    }
  };

  /**
   * Handles double-click events on cells to open a details modal.
   */
  const handleCellDoubleClick = (event: CellDoubleClickedEvent<TradeRow>) => {
    const clickedField = event.colDef.field;
    const clickedValue = event.value;
    if (clickedValue && clickedField) {
      setModalField(clickedField);
      setModalValue(String(clickedValue));
      setIsModalOpen(true);
    }
  };

  /**
   * Callback executed when the grid renders data for the first time.
   */
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

  /**
   * Toggles the auto-refresh functionality.
   */
  const onAutoRefresh = (checked: boolean) => {
    setAutoRefresh(checked);
  };

  // Effect to load initial page data when the component mounts or requestName changes
  useEffect(() => {
    sessionStorage.clear();

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

  // Effect to handle window resizing for responsive column definitions
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to apply the column state based on the current page/route
  useEffect(() => {
    const applyColumnState = async () => {
      const currentHref = pathname.split("/").filter(Boolean).pop();
      const state = await getColDefs(currentHref);
      gridColumnState.current = state;
    }
    applyColumnState();
  }, [pathname, getColDefs]);

  // Effect to manage the auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval = setInterval(() => {
      handleRefreshPage();
    }, 10000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [autoRefresh, handleRefreshPage]);

  return (
    <div className="pt-1 flex h-full flex-col w-full">
      {/* Top control bar with pagination, filters, and other actions */}
      <div className='bg-gray-200 lg:h-12 w-full grid grid-cols-3 lg:grid-cols-5 justify-around items-center border-1 border-gray-300'>
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

        {/* Pagination controls */}
        <div className='flex justify-center items-center col-span-3 lg:col-span-1'>
          <button
            onClick={handlePrev}
            disabled={pageIndex.current === 0}
            className={`flex justify-center items-center bg-gray-300 w-10 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${previousBtn}`}
          >
            <img src={"/prev.png"} className='h-6 w-8' alt="Previous"/>
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
            <img src={"/prev.png"} className='h-6 w-8 rotate-180' alt="Next"/>
          </button>
        </div>

        {/* Action buttons and dropdowns */}
        <div className='flex justify-center lg:justify-between items-center m-1 col-span-3 lg:col-span-2'>
          <div className='flex justify-center items-center'>
          {setTableUsed && (
            <div>
              <Dropdown 
                id='tables'
                label='Table'
                openDropdown={openDivDropdown}
                setOpenDropdown={setOpenDivDropdown}
              >
                {tables.map((table, id) => (
                  <div 
                    key={id} 
                    className={`py-1 px-5 cursor-pointer ${table.value === requestName ? "bg-blue-500 text-white" : ""}`} 
                    onClick={() => {
                      setTableUsed(table.value);
                      setOpenDivDropdown(null);
                    }}
                  >
                    {table.field}
                  </div>
                ))}
              </Dropdown>
            </div>
          )}
          {requestName === 'turnover' && (
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
          )}
            <div className='w-[25vw] md:w-[20vw] lg:w-[8vw]'>
              {gridRef.current?.api && (
                <ColumnSelector gridRef={gridRef}/>
              )}
            </div>
          </div>
          <div className='flex justify-center items-center'>
            <button
              onClick={handleFilter}
              className='mx-2'
              >
              <img src={"/clear-filter.png"} className="w-5 h-5 object-contain transition" alt="Clear Filter"/>
            </button>
            <button
              className={`${refreshBtn} mx-2`}
              onClick={handleRefreshPage}
              >
              <img
                src={'/refresh.png'}
                alt="Refresh"
                className="w-5 h-5 object-contain transition"
                />
            </button>
          </div>
        </div>
      </div>

      {/* Main AG-Grid container */}
      <div className={`flex flex-grow w-full`}>
        <div className={`flex flex-col ag-theme-alpine m-2 w-full relative min-h-screen lg:min-h-0`}>
          {loading && (
            <div className="absolute inset-0 bg-white z-10 bg-opacity-70 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="flex justify-center items-center gap-2 text-black animate-pulse font-bold text-3xl">
                  <img src={"/logo.png"} width={"48px"} alt="Loading..."/>Algoquant
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
            rowBuffer={0}
            enableCellTextSelection={true}
            onDragStopped={saveState}
            onPaginationChanged={loadState}
            suppressColumnMoveAnimation={true}
          />
        </div>
        {requestType === 'table' && requestName && (
          <RecordModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            field={modalField}
            value={modalValue}
            fileColDef={fileColDef}
            defaultColDef={defaultColDef}
            requestType={requestType}
            requestName={requestName}
            gridTheme={gridTheme}
          />
        )}
      </div>
    </div>
  );
};

export default TradeGrid;