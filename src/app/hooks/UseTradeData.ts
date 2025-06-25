import { useState } from 'react';
import oboe from 'oboe';
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

  const fetchPageViaGoto = (start: number, tableName: string, pageIndex: IndexType) => {
    const currentChunk: TradeRow[] = [];
    const nextChunk: TradeRow[] = [];
    const prevChunk: TradeRow[] = [];
    let stage: 'current' | 'next' | 'prev' | 'done' = 'current';

    oboe(`${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/goto?start=${start}&limit=${PAGE_SIZE}&tableName=${tableName}`)
      .node('![*]', (node) => {
        if (JSON.stringify(node) === '"stawp"') {
          stage = 'next';
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
        const curr = pageIndex.current;

        setRowData(currentChunk);
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
        console.error('Oboe failed:', err);
      });
  };

  const fetchConsecutive = (page: number, forward: boolean, tableName: string) => {
    const start = page * PAGE_SIZE;
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/consecutivesend?start=${start}&limit=${PAGE_SIZE}&action=${forward}&tableName=${tableName}`
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getby?field=${field}&value=${value}&tableName=${tableName}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data: TradeRow[] = await res.json();
    console.log("Fetched data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching records by field:", error);
    return []; // Return empty array on failure to prevent downstream errors
  }
};


 async function fetchTotalRecords(tableName: string) {
  console.log(tableName);
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/totalrecords?tableName=${tableName}`);
  const { total } = await response.json();
  return Math.ceil(total / PAGE_SIZE);
  };


  return {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    fetchTotalRecords,
    fetchRecordsByField
  };
};
