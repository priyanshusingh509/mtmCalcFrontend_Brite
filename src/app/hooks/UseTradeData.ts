import { useState } from 'react';
import oboe from 'oboe';
import { TradeRow } from '../types/TradeRow';
import { IndexType } from '../components/TradeGrid';
import { PAGE_SIZE } from '../utils/constants';
import dotenv from 'dotenv';
import { ColumnState } from 'ag-grid-enterprise';

dotenv.config();

// Type definitions
type RequestType = 'table' | 'aggregate';
type SummaryType = 'trader' | 'symbol' | undefined;
type DataChunk = {
  data: TradeRow[];
  lastUpdatedTime: string;
};

/**
 * Custom hook for managing trade data fetching and pagination
 * Handles data streaming, caching, and state management for trade data
 */
export const useTradeData = () => {
  // State for storing the current page's row data
  const [rowData, setRowData] = useState<TradeRow[]>([]);

  /**
   * Cleans up session storage to keep only the current and adjacent pages
   * @param pageIndex - Object containing the current page index
   */
  const keepOnlyThreePages = (pageIndex: IndexType): void => {
    const currentPage = pageIndex.current;
    const validPages = [
      `page-${currentPage - 1}`, 
      `page-${currentPage}`, 
      `page-${currentPage + 1}`,
      'username' // Preserve authentication data
    ];
    
    Object.keys(sessionStorage).forEach((key) => {
      if (!validPages.includes(key)) {
        sessionStorage.removeItem(key);
      }
    });
  };

  /**
   * Fetches a page of trade data with surrounding pages for smooth pagination
   * Uses streaming to efficiently load large datasets
   */
  async function fetchPageViaGoto(
    start: number,
    requestType: RequestType,
    requestName: string,
    pageIndex: IndexType,
    field: string,
    order: string,
    col: string | null,
    search: string | null,
    summaryType?: SummaryType
  ): Promise<{ total: number; lastUpdatedTime: string }> {
    const currentChunk: TradeRow[] = [];
    const nextChunk: TradeRow[] = [];
    const prevChunk: TradeRow[] = [];
    let stage: 'current' | 'next' | 'prev' | 'done' = 'current';

    const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/goto`;
    const body = {
      start,
      limit: 300,
      requestType,
      requestName,
      field,
      order,
      col,
      search,
      summaryType
    };
    console.time("oboe stream for page 1");
    console.time("oboe stream for all the pages includes page 1 as well");

    const oboePromise = new Promise<void>((resolve, reject) => {
      oboe({
        url: fetchURL,
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .node('![*]', (node: any) => {
        if (JSON.stringify(node) === '"stawp"') {
          stage = 'next';
          setRowData(currentChunk);
          console.timeEnd("oboe stream for page 1");
          return oboe.drop;
        }

        if (node?.data === null) {
          if (stage === 'next') stage = 'prev';
          else if (stage === 'prev') stage = 'done';
          return oboe.drop;
        }

        switch (stage) {
          case 'current':
            currentChunk.push(node);
            break;
          case 'next':
            nextChunk.push(node);
            break;
          case 'prev':
            prevChunk.push(node);
            break;
        }
      })
      .done(() => {
        console.timeEnd("oboe stream for all the pages includes page 1 as well");
        resolve();
      })
      .fail((err: any) => {
        setRowData([]);
        reject(err);
      });
    });

    // Wait for stream to complete
    await oboePromise;
    // 🔄 Fetch total and lastUpdated AFTER data is collected
    const { total, lastUpdatedTime } = await fetchTotalRecords(requestType, requestName, summaryType, col, search);

    // ✅ Store each window with timestamp
    const curr = pageIndex.current;
    sessionStorage.setItem(`page-${curr}`, JSON.stringify({
      data: currentChunk,
      lastUpdatedTime
    }));
    if (nextChunk.length > 0) {
      sessionStorage.setItem(`page-${curr + 1}`, JSON.stringify({
        data: nextChunk,
        lastUpdatedTime
      }));
    }
    if (curr > 0 && prevChunk.length > 0) {
      sessionStorage.setItem(`page-${curr - 1}`, JSON.stringify({
        data: prevChunk,
        lastUpdatedTime
      }));
    }

    // Clean up others
    keepOnlyThreePages(pageIndex);

    return {
      total,
      lastUpdatedTime
    };
  }


  /**
   * Fetches consecutive pages of trade data for pagination
   * Used when user navigates beyond the pre-fetched pages
   */
  async function fetchConsecutive(
    page: number,
    forward: boolean,
    requestType: RequestType,
    requestName: string | undefined,
    field: string,
    order: string,
    col: string | null,
    search: string | null,
    summaryType?: SummaryType
  ): Promise<{ total: number; lastUpdatedTime: string }> {
    const start = page * PAGE_SIZE;
    const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/consecutivesend`;
    const body = {
      start,
      limit: PAGE_SIZE,
      action: forward,
      requestType,
      requestName,
      field,
      order,
      col,
      search,
      summaryType
    };

    let pageData: TradeRow[] = [];

    try {
      const res = await fetch(fetchURL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      pageData = await res.json(); // Save result

    } catch (err) {
      console.error('Error prefetching:', err);
    }

    const { total, lastUpdatedTime } = await fetchTotalRecords(requestType, requestName, summaryType, col, search);

    // ✅ Now we have both pageData & lastUpdatedTime — safe to store
    sessionStorage.setItem(`page-${page}`, JSON.stringify({
      data: pageData,
      lastUpdatedTime
    }));

    return { total, lastUpdatedTime };
  }


  /**
   * Fetches trade records filtered by a specific field value
   * Returns data formatted for display in two separate grids
   */
  const fetchRecordsByField = async (
    col: string,
    search: string | number,
    requestType: RequestType | undefined,
    requestName: string | undefined,
    summaryType?: SummaryType
  ): Promise<{ firstGrid: TradeRow[]; secondGrid: TradeRow[] }> => {
  try {
    const fetchUrl = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getby`;
    const body = { col, search, requestType, requestName, summaryType };

    const res = await fetch(fetchUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const { firstGrid, secondGrid }: { firstGrid: TradeRow[]; secondGrid: TradeRow[] } = await res.json();
    return { firstGrid, secondGrid };
  } catch (error) {
    console.error("Error fetching records by field:", error);
    return { firstGrid: [], secondGrid: [] };
  }
};



 async function fetchTotalRecords(requestType: string, requestName: string | undefined, summaryType?: "trader" | "symbol", col: string | null = null , search: string | null = null) {
  const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/totalrecords`;
  const body = {
    requestType,
    requestName,
    summaryType,
    col,
    search
  }
  const response = await fetch(fetchURL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
    'Content-Type': 'application/json',
  },
  });
  const { total, lastUpdatedTime } = await response.json();
  return {
    total: Math.ceil(total / PAGE_SIZE),
    lastUpdatedTime
  };
  };

async function fetchFilteredData(requestName: string | undefined, search: string, col: string, summaryType?: "trader" | "symbol") {
  try {
    const fetchUrl = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getFilteredData`;
    const body = {
      requestName,
      summaryType,
      search,
      col
    }
    const res = await fetch(fetchUrl, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
        'Content-Type': 'application/json',
      },
    });
    const data: TradeRow[] = await res.json();
      setRowData(data)
  } catch (err) {
    console.error('Error fetching filtered data:', err);
  }
};


async function saveColDefs(state: ColumnState[], currentHref: string | undefined){
  const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/saveColDefs`;
  const body = {
    state,
    currentHref
  }
  fetch(fetchURL,{credentials: 'include', method: 'POST',
    body: JSON.stringify(body),
    headers: {
        'Content-Type': 'application/json',
    },
  });
}

/**
 * Retrieves column definitions for the current view from the backend
 * @param currentHref - The current URL/path to identify the view
 * @returns Promise containing the column definitions
 */
async function getColDefs(currentHref: string | undefined) {
  const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getColDefs`;
  const body = { currentHref };

  const response = await fetch(fetchURL, {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // If unauthorized, attempt to refresh the access token
  if (!response.ok) {
    await getAccessToken();
  }

  const data = await response.json();
  return data;
}

/**
 * Refreshes the authentication token using the refresh token
 * @returns Promise that resolves when token refresh is complete
 */
async function getAccessToken() {
  const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/user/refresh-token`;
  return fetch(fetchURL, {
    method: 'POST', 
    credentials: 'include' // Include cookies for authentication
  });
}

  // Return the public API of the hook
  return {
    // Current page's trade data and setter
    rowData,        // Array of TradeRow objects for the current view
    setRowData,     // Function to update the row data
    
    // Data fetching functions
    fetchPageViaGoto,      // Fetch a specific page with surrounding pages
    fetchConsecutive,      // Load consecutive pages for pagination
    
    // Data management utilities
    keepOnlyThreePages,    // Optimize session storage usage
    fetchTotalRecords,     // Get total record count and last update time
    
    // Data filtering and querying
    fetchRecordsByField,   // Get records filtered by specific field
    fetchFilteredData,     // Apply complex filters to the data
    
    // Column configuration
    saveColDefs,    // Save column layout/configuration
    getColDefs      // Retrieve saved column configuration
  };
};