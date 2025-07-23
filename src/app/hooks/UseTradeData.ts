import { useRef, useState } from 'react';
import oboe from 'oboe';
// import clarinet from 'clarinet';

// import { patchOboeHeaders } from '../utils/patchOboe';
// patchOboeHeaders();
import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';

import dotenv from 'dotenv';
import { IndexType } from '../components/TradeGrid';
import { ColDef, ColumnState } from 'ag-grid-enterprise';
dotenv.config();

  

export const useTradeData = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  const keepOnlyThreePages = (pageIndex: IndexType) => {
    const curr = pageIndex.current;
    const valid = [`page-${curr - 1}`, `page-${curr}`, `page-${curr + 1}`,"username"];
    Object.keys(sessionStorage).forEach((key) => {
      if (!valid.includes(key)) {
        sessionStorage.removeItem(key);
      }
    });
  };

  async function fetchPageViaGoto(
    start: number,
    requestType: 'table' | "aggregate",
    requestName: string,
    pageIndex: IndexType,
    field: string,
    order: string,
    col: string | null,
    search: string | null,
    summaryType?: "trader" | "symbol" 
  ) {
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
    // //console.log(body)
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
      .node('![*]', (node) => {
        if (JSON.stringify(node) === '"stawp"') {
          stage = 'next';
          setRowData(currentChunk);
          //console.log("changed from oboe")
          console.timeEnd("oboe stream for page 1");
          //console.log("updated page 1 by setRowData()");
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
      .fail((err) => {
        // console.error('Oboe failed:', err);
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


  async function fetchConsecutive(
    page: number,
    forward: boolean,
    requestType: 'table' | 'aggregate',
    requestName: string | undefined,
    field: string,
    order: string,
    col: string | null,
    search: string | null,
    summaryType?: "trader" | "symbol"
  ) {
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


  const fetchRecordsByField = async (
  col: string,
  search: string | number,
  requestName: string | undefined,
  summaryType?: "trader" | "symbol"
): Promise<{ firstGrid: TradeRow[]; secondGrid: TradeRow[] }> => {
  try {
    const fetchUrl = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getby`;
    const body = { col, search, requestName, summaryType };

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
  // //console.log(requestName);
  // //console.log("fetch total col:",col)
  const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/totalrecords`;
  const body = {
    requestType,
    requestName,
    summaryType,
    col,
    search
  }
  // //console.log(body)
  const response = await fetch(fetchURL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
    'Content-Type': 'application/json',
  },
  });
  const { total, lastUpdatedTime } = await response.json();
  // //console.log(total, lastUpdatedTime);
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
    // //console.log(body)
    const res = await fetch(fetchUrl, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
        'Content-Type': 'application/json',
      },
    });
    const data: TradeRow[] = await res.json();
    // //console.log(data);
    // setTimeout(()=>
      setRowData(data)
    // ,10)
  } catch (err) {
    console.error('Error fetching filtered data:', err);
  }
};


async function saveColDefs(state: ColumnState[], currentHref: string | undefined){
  // //console.log(state, currentHref);
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
  
  if (!response.ok) {
    getAccessToken();
  }

  const data = await response.json();
  // //console.log(data);
  return data;
}

async function getAccessToken(){
  const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/user/refresh-token`;
  const response = await fetch(fetchURL, {method: 'POST', credentials: 'include'});
}



  return {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    fetchTotalRecords,
    fetchRecordsByField,
    fetchFilteredData,
    saveColDefs,
    getColDefs
  };
};
