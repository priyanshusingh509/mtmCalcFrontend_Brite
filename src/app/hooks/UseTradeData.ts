'use client';

import { useState, useRef } from 'react';
import oboe from 'oboe';
import { TradeRow } from '../types/TradeRow';
import { PAGE_SIZE } from '../utils/constants';

// 👇 Central shared ref
const pageIndex = { current: 0 };

export const useTradeData = () => {
  const [rowData, setRowData] = useState<TradeRow[]>([]);

  const keepOnlyThreePages = () => {
    const curr = pageIndex.current;
    const valid = [`page-${curr - 1}`, `page-${curr}`, `page-${curr + 1}`];
    Object.keys(localStorage).forEach((key) => {
      if (!valid.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };

  const fetchPageViaGoto = (start: number) => {
    let currentChunk: TradeRow[] = [];
    let nextChunk: TradeRow[] = [];
    let prevChunk: TradeRow[] = [];
    let stage: 'current' | 'next' | 'prev' | 'done' = 'current';

    oboe(`http://192.168.4.200:3000/goto?start=${start}&limit=${PAGE_SIZE}`)
      .node('![*]', (node: any) => {
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

  const fetchConsecutive = (page: number, forward: boolean) => {
    const start = page * PAGE_SIZE;
    fetch(
      `http://192.168.4.200:3000/consecutivesend?start=${start}&limit=${PAGE_SIZE}&action=${forward}`
    )
      .then((res) => res.json())
      .then((data: TradeRow[]) => {
        localStorage.setItem(`page-${page}`, JSON.stringify(data));
      })
      .catch((err) => {
        console.error('Error prefetching:', err);
      });
  };

  return {
    rowData,
    setRowData,
    fetchPageViaGoto,
    fetchConsecutive,
    keepOnlyThreePages,
    pageIndex // 👈 now export this
  };
};
