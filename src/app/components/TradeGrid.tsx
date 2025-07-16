'use client';

import { use, useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, FilterModel, GridApi, GridReadyEvent, themeAlpine, themeQuartz } from 'ag-grid-community';
import { CellDoubleClickedEvent, FilterChangedEvent, FilterDestroyedEvent, FilterManager, SortChangedEvent } from 'ag-grid-community';
import RecordModal from './RecordModal';
import CustomFilter from './CustomFilter';
import { useTradeData } from '../hooks/UseTradeData';


import {
  ModuleRegistry,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ColumnApiModule,
  SuppressHeaderKeyboardEventParams,
  ScrollApiModule,
  RenderApiModule
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ColumnApiModule ,
  ScrollApiModule,
  RenderApiModule 
]);

import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';
import ColumnSelector from './ColumnSelector';

export interface IndexType{
  current: number;
}

type TradeGridProps = {
  mobColDef: ColDef[],
  fileColDef: ColDef[];
  tableName: string;
  pageIndex: IndexType;
  summaryType?: "trader" | "symbol";
};


const TradeGrid = ({mobColDef, fileColDef, tableName, pageIndex, summaryType }: TradeGridProps) => {
  // console.log(summaryType)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [inputPage, setInputPage] = useState(pageIndex.current + 1);
  const [clearSortSignal, setClearSortSignal] = useState(0);
  const [loading, setloading] = useState(true);
  const [clearSignal, setClearSignal] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  // const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const currentSortField= useRef<string>(''); // default: empty string  
  // const nextSortField = useRef<string>('');
  const sortOrder= useRef<'asc' | 'desc' | ''>(''); // default: empty string
  const [currentFilterCol, setCurrentFilterCol] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState<string | null>(null);
  // const [timeIsUpdated,settimeIsUpdated] = useState(false);

  const handleSearch = async (tableName: string, col: string, search: string) => {
    setCurrentFilterCol(col);
    setCurrentSearch(search);

    const { total, lastUpdatedTime } = await fetchPageViaGoto(0, tableName, { current: 0}, currentSortField.current, sortOrder.current, col, search, summaryType)
    // console.log(col)
    setTotalPages(total);
    // console.log(total);
    // setLastUpdated(lastUpdatedTime)
    lastUpdated.current = lastUpdatedTime
    pageIndex.current = 0;
  };
  const gridRef = useRef<AgGridReact<TradeRow> | null>(null);
  const gridTheme = themeAlpine.withParams({
    spacing: 6,
    accentColor: '#2196F3',
    oddRowBackgroundColor: '#00000008',
    wrapperBorderRadius: 10,
    rowBorder: true
  })

  const {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages
  } = useTradeData();

  const columnDefs: ColDef[] = [
  {
    headerName: 'Index',
    valueGetter: params => (pageIndex.current*PAGE_SIZE) + (params?.node?.rowIndex ?? 0) + 1,
    sortable: false,
    filter: false,
    width: 100,
    headerComponent: ()=>{
      return <div className='font-semibold w-full flex justify-center'>Index</div>
    } ,
    cellClass: 'font-bold text-center',
    
  },
  ...fileColDef
];

  const defaultColDef: ColDef = {
    cellClass: 'text-right',
    resizable: true,
    filter: true,
    minWidth: 120,
    headerComponent: CustomFilter,
    headerComponentParams: {
      tableName: tableName,
      onSearch: handleSearch,
      currentFilterCol,
      summaryType: summaryType,
      clearSignal,
      clearSortSignal
    },
    sortable: true,
    // cellDataType:false,
    suppressHeaderKeyboardEvent(params: SuppressHeaderKeyboardEventParams) {
      if( params.event.key === 'Enter' ){
        return true
      }
      return false
    },
  };

  const handlePrev = async () => {
    setPreviousBtn("cursor-wait shadow-2xl");
    if (pageIndex.current === 0) return;

    pageIndex.current -= 1;
    const curr = pageIndex.current;
    const prev = curr - 1;  

    const currentCached = localStorage.getItem(`page-${curr}`);
    if (currentCached) {
      const parsed = JSON.parse(currentCached);
      setRowData(parsed.data || parsed);
      lastUpdated.current = parsed.lastUpdatedTime || lastUpdated.current;
    }


    keepOnlyThreePages(pageIndex);
    const {total, lastUpdatedTime} = await fetchConsecutive(prev, false, tableName, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTotalPages(total);
    lastUpdated.current = lastUpdatedTime;
    setTimeout(()=>{
      setPreviousBtn("");
    }, 70)
    // if (!localStorage.getItem(`page-${prev}`) && curr > 0) {
    // }
    // if (!localStorage.getItem(`page-${next}`)) {
    //   fetchConsecutive(curr+1, true);
    // }
  };

  const handleNext = async () => {
    setNextBtn("cursor-wait shadow-2xl");
    pageIndex.current += 1;
    const curr = pageIndex.current;
    const next = curr + 1;

    const currentCached = localStorage.getItem(`page-${curr}`);
    if (currentCached) {
      const parsed = JSON.parse(currentCached);
      setRowData(parsed.data || parsed); // Fallback for old format
      lastUpdated.current = parsed.lastUpdatedTime || lastUpdated.current;
    }

    keepOnlyThreePages(pageIndex);

    const {total, lastUpdatedTime} = await fetchConsecutive(next, true, tableName, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTotalPages(total);
    lastUpdated.current = lastUpdatedTime;
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
    if (isNaN(page) || page < 1 || page>totalPages){
      alert("page does not exist");

      return;
    } 
    pageIndex.current = page - 1;
    localStorage.clear();   // reset everything
    const { total, lastUpdatedTime } = await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, tableName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTotalPages(total);
    lastUpdated.current = lastUpdatedTime;
    setTimeout(()=>{
      setGoBtn("");
    }, 150);
  };

  const handleRefreshPage = async () => {
    setRefreshBtn("cursor-wait shadow-2xl");  
    const loadinitialpage = async () => {
      const {total, lastUpdatedTime} = await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, tableName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
      setTotalPages(total);
      lastUpdated.current = lastUpdatedTime;
      console.log("lastupdated 2",lastUpdated);
    }
    loadinitialpage();
    // setRefreshBtn("");
    setTimeout(()=>{
      setRefreshBtn("");
    },70)
  }
    const handleFilter = async () => {
      localStorage.clear(); 
      const api = gridRef.current?.api;
      // console.log(gridRef.current);
      api?.setFilterModel(null);        // Clear filter
      api?.resetColumnState();            // Clear sorting
      setCurrentFilterCol(null);
      setClearSignal(prev => prev + 1);       // Notify filters
      setClearSortSignal(prev => prev + 1);   // Notify sort headers

      // Reset sort refs so backend gets clean request
      currentSortField.current = '';
      sortOrder.current = '';
      // Refetch with no filters or sort
      const {total, lastUpdatedTime} = await  fetchPageViaGoto(0, tableName, { current: 0 }, '', '', null, null, summaryType);
      setTotalPages(total);
      // setLastUpdated(lastUpdatedTime);
      lastUpdated.current = lastUpdatedTime
    };


  const handleSort = async (event: SortChangedEvent<TradeRow>) => {
    const columnState = event.api.getColumnState();
    // console.log("heloow to ogasdoa: ",columnState);
    const sortedColumn = columnState.find(col => col.sort !== null);
    console.log("sorted column : ",sortedColumn)
    // console.log("this is called", sortedColumn);

    if (sortedColumn) {
      // setSortField(sortedColumn.colId || '');

      currentSortField.current = sortedColumn.colId || '';
      // setSortOrder(sortedColumn.sort as 'asc' | 'desc');
      sortOrder.current = sortedColumn.sort as 'asc' | 'desc';
    } else {
      // setSortField('');
      currentSortField.current = '';
      // setSortOrder('');
      sortOrder.current = '';
    }
    const {total, lastUpdatedTime} = await fetchPageViaGoto(pageIndex.current * PAGE_SIZE, tableName, pageIndex, currentSortField.current, sortOrder.current, currentFilterCol, currentSearch, summaryType);
    setTotalPages(total);
    lastUpdated.current = lastUpdatedTime;
  };

function timeToSeconds(t: string | undefined | null) {
    if (t) {
      const [h, m, s = 0] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
    }
    return 1e+17;
}


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
  const lastUpdated = useRef<string>('');


  // const NoDataComponent = () =>{
  //     console.log("lastupdated",lastUpdated.current)
  //     if (timeToSeconds(lastUpdated.current) < timeToSeconds("10:30:00")) {
  //       return <div>
  //       Market Data Updates at 9:30

  //     </div>
  //     }
  //     return <div>No rows to show</div>
  // };
  const autoFitOrSizeToFit = (api: GridApi) => {
    // const containerWidth = api.getHorizontalPixelRange().right || 0;
    const allColumns = api.getColumns();
    // const allColumnsLegth = api.getColumns()?.length;
    if (!allColumns) return;
    // console.log("total, container",totalColWidth, containerWidth)
    if (allColumns.length <= 19) {
      api.sizeColumnsToFit();
      console.log("this ran 1")
    }
  };

  const onFirstDataRendered = () => {
    console.log("call from on first data rendered");
    const api = gridRef.current?.api;
    if (api){
      api.sizeColumnsToFit();
      autoFitOrSizeToFit(api);
    } 
    setloading(false);
    
  };

  // useEffect(() => {
  //   console.log("call from use eff")
  //   const handleResize = () => {
  //     if (gridRef.current?.api) {
  //       autoFitOrSizeToFit(gridRef.current.api);
  //     }
  //   };
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  useEffect(() => {

    const loadInitialPage = async () => {
      const { total, lastUpdatedTime } = await fetchPageViaGoto(
        pageIndex.current * PAGE_SIZE,
        tableName,
        pageIndex,
        currentSortField.current,
        sortOrder.current,
        currentFilterCol,
        currentSearch,
        summaryType
      );
      // setLastUpdated(lastUpdatedTime);
      setTotalPages(total);
      lastUpdated.current = lastUpdatedTime;
    };
    loadInitialPage();
  }, []);

  useEffect(() => {
    if(loading){
    document.body.style.overflow = 'hidden';
    }else{
      document.body.style.overflow = 'unset';

    }
  }, [loading])
  useEffect(() => {
    function handleResize() {
      console.log("THISSSS")
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [])




  // console.log("this should work ",totalPages);

  return (
    <div className="pt1 flex h-full flex-col w-full">
      {/* Pagination Controls */}
      <div className="flex-col lg:flex-row justify-center items-center p-4 gap-2 hidden">
        <div className='font-semibold'>Last Updated: {lastUpdated.current}</div>
        <div>
          <button
            onClick={handlePrev}
            disabled={pageIndex.current === 0}
            className={`px-4 py-2 w-[25vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${previousBtn}`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-lg font-semibold">
            Page {pageIndex.current + 1} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={pageIndex.current >= (totalPages - 1)}
            className={`px-4 py-2 w-[25vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${nextBtn}`}
          >
            Next
          </button>
        </div>
        <div className='flex'>
          <button
          onClick={handleFilter}
          className={`mx-1 px-4 py-2 w-[30vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${nextBtn}`}
          >
            Clear Filter
          </button>
          <input
            type="number"
            min="1"
            value={inputPage}
            onChange={handleInputPageChange}
            onKeyPress={handleKeyPress}
            placeholder="Search"
            className="hidden md:block mx-1 p-2 w-[20vw] lg:w-[10vw] border border-gray-300 rounded text-center"
          />
          <button
            onClick={handleGoToInputPage}
            className={`hidden md:block mx-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:scale-95 transition transform duration-100 ${goBtn}`}
          >
            Go
          </button>
          <button
          className={`mx-1 px-4 py-2 w-[25vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer active:scale-95 transition transform duration-100 ${refreshBtn}`}
          onClick={handleRefreshPage}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* AG Grid */}
      <div className='bg-gray-200 lg:h-12 w-full grid grid-cols-1 lg:grid-cols-3 justify-around items-center border-1 border-gray-300'>
        <div className='flex justify-center items-center font-semibold'>Last Updated: {lastUpdated.current}</div>
        <div className='flex justify-center items-center '>
          <button
            onClick={handlePrev}
            disabled={pageIndex.current === 0}
            className={`bg-gray-300 w-10 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${previousBtn}`}
          >
            {"<"}
          </button>
          {/* <span className="px-4 py-2 text-lg font-semibold">
            {pageIndex.current + 1} / {totalPages}
          </span> */}
          <div className='flex px-4 py-2 text-lg font-semibold'>
            <input
              type="number"
              min="1"
              value={inputPage}
              onChange={handleInputPageChange}
              onKeyPress={handleKeyPress}
              className="w-8 border border-gray-300 rounded text-center"
              />
              / {totalPages}
          </div>
          <button
            onClick={handleNext}
            disabled={pageIndex.current >= (totalPages - 1)}
            className={`bg-gray-300 w-10 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${nextBtn}`}
          >
            {">"}
          </button>
        </div>
        <div className='flex justify-center items-center m-1'>
          <button
          onClick={handleFilter}
          className={`mx-1 px-4 py-2 w-[30vw] md:w-[20vw] lg:w-[8vw] bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 transition transform duration-100 ${nextBtn}`}
          >
            Clear Filter
          </button>
          {/* <button
            onClick={handleGoToInputPage}
            className={`hidden md:block mx-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:scale-95 transition transform duration-100 ${goBtn}`}
          >
            Go
          </button> */}
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
      <div className={`flex flex-grow w-full`}>
        <div className={`flex flex-col ag-theme-alpine m-2 w-full relative min-h-screen lg:min-h-0`}>
          {loading && (
            <div className="absolute inset-0 bg-white z-3 bg-opacity-70 flex items-center justify-center">
              <div className="flex flex-col items-center">
                {/* <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" /> */}
                <div className="flex justify-center items-center gap-2 text-black animate-pulse font-bold text-3xl"><img src={"logo.png"} width={"48px"}/>Algoquant</div>
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
              // onDisplayedColumnsChanged={onFirstDataRendered}
              // autoSizeStrategy={{ type: 'fitCellContents', skipHeader: true }}
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
