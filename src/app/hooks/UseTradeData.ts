import { useState } from 'react';
import oboe from 'oboe';
import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';

import dotenv from 'dotenv';
dotenv.config();

const pageIndex = { current: 0 };
export const useTradeData = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);
  
  const keepOnlyThreePages = () => {
    const curr = pageIndex.current;
    const valid = [`page-${curr - 1}`, `page-${curr}`, `page-${curr + 1}`,"username"];
    Object.keys(localStorage).forEach((key) => {
      if (!valid.includes(key)) {
        localStorage.removeItem(key);
      }
    });          
  };

  const fetchPageViaGoto = (start: number, field:string, order:string) => {
    const currentChunk: TradeRow[] = [];
    const nextChunk: TradeRow[] = [];
    const prevChunk: TradeRow[] = [];
    let stage: 'current' | 'next' | 'prev' | 'done' = 'current';
    const fetchURL = (field === '') ? `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/goto?start=${start}&limit=${PAGE_SIZE}`:`${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/goto?start=${start}&limit=${PAGE_SIZE}&field=${field}&order=${order}`;
    console.log("fetchURL: ",fetchURL);
    console.log(field,order); 
    oboe(fetchURL)
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
        keepOnlyThreePages();
        
      })
      .fail((err) => {
        console.error('Oboe failed:', err);
      });
  };

  const fetchConsecutive = (page: number, forward: boolean, field : string, order: string) => {
    const start = page * PAGE_SIZE;
    const fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/consecutivesend?start=${start}&limit=${PAGE_SIZE}&action=${forward}&field=${field}&order=${order}`
    fetch(
      fetchURL
    )
      .then((res) => res.json())
      .then((data: TradeRow[]) => {
        localStorage.setItem(`page-${page}`, JSON.stringify(data));
      })
      .catch((err) => {
        console.error('Error prefetching:', err);
      });
  };

  const fetchRecordsByField = async (field: string, value: string | number): Promise<TradeRow[]> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/getby?field=${field}&value=${value}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data: TradeRow[] = await res.json();
    console.log("Fetched data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching records by field:", error);
    return []; // Return empty array on failure to prevent downstream errors
  }
};


  async function fetchTotalRecords() {
  const tablename = "bse";
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_IP}/trade/totalrecords?Tablename=${tablename}`);
  const { total } = await response.json();
  return Math.ceil(total / PAGE_SIZE);
  };


  return {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    pageIndex, // 👈 now export this
    fetchTotalRecords,
    fetchRecordsByField
  };
};
