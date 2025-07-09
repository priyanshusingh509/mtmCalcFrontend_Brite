import { useRef, useState } from 'react';
import oboe from 'oboe';
// import clarinet from 'clarinet';

// import { patchOboeHeaders } from '../utils/patchOboe';
// patchOboeHeaders();
import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';

import dotenv from 'dotenv';
import { IndexType } from '../components/TradeGrid';
dotenv.config();

  

export const useTradeData = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  const keepOnlyThreePages = (pageIndex: IndexType) => {
    const curr = pageIndex.current;
    const valid = [`page-${curr - 1}`, `page-${curr}`, `page-${curr + 1}`,"username"];
    Object.keys(localStorage).forEach((key) => {
      if (!valid.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };

  async function fetchPageViaGoto(start: number, tableName: string, pageIndex: IndexType, field:string, order:string, col: string | null, search: string | null, summaryType?: "trader" | "symbol") {
    const currentChunk: TradeRow[] = [];
    const nextChunk: TradeRow[] = [];
    const prevChunk: TradeRow[] = [];
    let stage: 'current' | 'next' | 'prev' | 'done' = 'current';
    const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/goto`;
    console.log("fetchURL: ",fetchURL);
    const body= {
      start,
      limit: 300,
      tableName,
      field,
      order,
      col,
      search,
      summaryType
    }
    // console.log("this did happen",field,order); 
    console.time("oboe stream for page 1")
    console.time("oboe stream for all the pages includes page 1 as well");
    oboe({
      url: fetchURL,
      method: 'POST',
      body: JSON.stringify(body),
       headers: {
         'Content-Type': 'application/json',
        },
      })
      .node('![*]', (node) => {
        if (JSON.stringify(node) === '"stawp"') {
          stage = 'next';
          setRowData(currentChunk);
          console.timeEnd("oboe stream for page 1");
          console.log("updated page 1 by setRowData()")
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
        const curr = pageIndex.current;

        localStorage.setItem(`page-${curr}`, JSON.stringify(currentChunk));
        if (nextChunk.length > 0) {
          localStorage.setItem(`page-${curr + 1}`, JSON.stringify(nextChunk));
        }
        if (curr > 0 && prevChunk.length > 0) {
          localStorage.setItem(`page-${curr - 1}`, JSON.stringify(prevChunk));
        }
        keepOnlyThreePages(pageIndex);
        
      })
      .fail((err) => {
        setRowData([]);
        console.log('Oboe failed:', err);
      });
  };

 async function fetchConsecutive (page: number, forward: boolean, tableName: string, field : string, order: string, col: string | null, search: string | null, summaryType?: "trader" | "symbol") {
    const start = page * PAGE_SIZE;
    const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/consecutivesend`
    const body = {
      start,
      limit: PAGE_SIZE,
      action: forward,
      tableName,
      field,
      order,
      col,
      search,
      summaryType
    }
    fetch(
      fetchURL, {
        method: 'POST',
        body: JSON.stringify(body),
         headers: {
    'Content-Type': 'application/json',
  },
      }
    )
      .then((res) => res.json())
      .then((data: TradeRow[]) => {
        localStorage.setItem(`page-${page}`, JSON.stringify(data));
      })
      .catch((err) => {
        console.error('Error prefetching:', err);
      });
  };

  const fetchRecordsByField = async (field: string, value: string | number, tableName: string): Promise<TradeRow[]> => {
  try {
    const fetchUrl = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getby`;
    const body = {
      field,
      value,
      tableName
    }
    const res = await fetch(fetchUrl, {
      method: 'POST',
      body: JSON.stringify(body),
       headers: {
    'Content-Type': 'application/json',
  },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data: TradeRow[] = await res.json();
    console.log("Fetched data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching records by field:", error);
    return []; // Return empty array on failure to prevent downstream errors
  }
};


 async function fetchTotalRecords(tableName: string, summaryType?: "trader" | "symbol", col: string | undefined = undefined , search: string | undefined = undefined) {
  console.log(tableName);
  console.log("fetch total col:",col)
  const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/totalrecords`;
  const body = {
    tableName,
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
  console.log(total, lastUpdatedTime);
  return {
    total: Math.ceil(total / PAGE_SIZE),
    lastUpdatedTime
  };
  };

async function fetchFilteredData(tableName: string, search: string, col: string, summaryType?: "trader" | "symbol") {
  try {
    const fetchUrl = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getFilteredData`;
    const body = {
      tableName,
      summaryType,
      search,
      col
    }
    console.log(body)
    const res = await fetch(fetchUrl, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
        'Content-Type': 'application/json',
      },
    });
    const data: TradeRow[] = await res.json();
    // console.log(data);
    // setTimeout(()=>
      setRowData(data)
    // ,10)
  } catch (err) {
    console.error('Error fetching filtered data:', err);
  }
};


  return {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    fetchTotalRecords,
    fetchRecordsByField,
    fetchFilteredData
  };
};
