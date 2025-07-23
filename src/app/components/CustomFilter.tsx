import React, { useRef, useState, useEffect } from 'react';

const CustomFilter = (props: any) => {
  const {
    displayName,
    column,
    setSort,
    enableSorting,
    requestName,
    onSearch,
    currentFilterCol, // This prop is now unused in this component but kept for API consistency
    summaryType,
    clearSignal,
    clearSortSignal
  } = props;

  // Ref for the main component div to handle clicks outside
  const filterBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // ✅ Single source of truth for UI visibility
  const [isInputVisible, setIsInputVisible] = useState(false);
  
  // State for internal component logic
  const [sortClass, setSortClass] = useState("hidden");
  const [filterClass, setFilterClass] = useState("");
  const sortIndexRef = useRef(0);
  const [filterText, setFilterText] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const closeInput = () => {
    setIsInputVisible(false);
  };

  const toggleInput = () => {
    setIsInputVisible(prev => !prev);
  };

  const sortCycleMap: Record<number, ['asc', ""] | ['desc', "rotate-180"] | [null, "hidden"]> = {
    0: [null, "hidden"],
    1: ['asc', ""],
    2: ['desc', "rotate-180"],
  };

  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFilterText(value);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      value ? setFilterClass("Applied") : setFilterClass('');
      await onSearch(requestName, column.colId, value, summaryType);
    }, 500);
  };

  const handleSortClick = () => {
    if (!enableSorting || !setSort) return;
    sortIndexRef.current = (sortIndexRef.current + 1) % 3;
    const [sortOrder, sortClassType] = sortCycleMap[sortIndexRef.current];
    setSort(sortOrder);
    setSortClass(sortClassType);
  };

  // ✅ Effect to clear the filter when the parent sends a signal
  useEffect(() => {
    if (clearSignal > 0) { // Check to avoid running on initial mount if clearSignal is 0
        setFilterText('');
        setFilterClass('');
        setIsInputVisible(false);
    }
  }, [clearSignal]);

  // ✅ Effect to handle event listeners based on visibility
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isInputVisible && inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeInput();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isInputVisible && filterBoxRef.current && !filterBoxRef.current.contains(e.target as Node)) {
        closeInput();
      }
    };

    // Only add listeners when the input is visible for better performance
    if (isInputVisible) {
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInputVisible]);

  // ✅ Effect to clear the sort when the parent sends a signal
  useEffect(() => {
    if (clearSortSignal > 0) {
        sortIndexRef.current = 0;
        setSortClass("hidden");
    }
  }, [clearSortSignal]);

  return (
    <div ref={filterBoxRef} className="grid grid-cols-3 h-full w-full relative px-1">
      {/* ✅ JSX now correctly uses isInputVisible state */}
      {!isInputVisible && <div />}
      {!isInputVisible && (
        <div
          className="font-semibold cursor-pointer flex justify-center items-center"
          onClick={handleSortClick}
          title="Click to sort"
        >
          {displayName}
        </div>
      )}

      {!isInputVisible && (
        <button
          onClick={toggleInput}
          className="ml-1 text-gray-600 hover:text-black focus:outline-none flex justify-end items-center"
          title="Filter"
        >
          <div className='flex'>
            <img className={sortClass} src="sort.png" width="16px" alt="Sort"/>
            <img src={`filter${filterClass}.png`} width="16px" className='min-w-4 bg-gray-100' alt="Filter"/>
          </div>
        </button>
      )}

      {isInputVisible && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={filterText}
          onChange={onFilterChange}
          className="absolute top-0 left-0 z-10 w-full h-[calc(70%)] px-2 py-1 text-sm text-black bg-white border focus:outline-blue-500 rounded shadow-md col-span-3"
        />
      )}
    </div>
  );
};

export default CustomFilter;