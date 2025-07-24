import React, { useRef, useState, useEffect } from 'react';

// Define the types for the component props for type safety and clarity.
interface CustomFilterProps {
  displayName: string;
  column: { colId: string };
  setSort: (sortOrder: 'asc' | 'desc' | null) => void;
  enableSorting: boolean;
  requestName: string;
  onSearch: (requestName: string, colId: string, value: string, summaryType: any) => Promise<void>;
  summaryType: any;
  clearSignal: number;
  clearSortSignal: number;
}

/**
 * CustomFilter provides a header component for an AG-Grid column with sorting and filtering functionality.
 * It includes a text input for filtering with debouncing and a three-state sort button.
 */
const CustomFilter = (props: CustomFilterProps) => {
  const {
    displayName,
    column,
    setSort,
    enableSorting,
    requestName,
    onSearch,
    summaryType,
    clearSignal,
    clearSortSignal,
  } = props;

  // Refs for DOM elements
  const filterBoxRef = useRef<HTMLDivElement>(null); // Ref for the main component div to handle outside clicks.
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the filter input to manage focus.

  // State for UI visibility
  const [isInputVisible, setIsInputVisible] = useState(false); // Controls whether the filter input is visible.

  // State for internal component logic
  const [sortClass, setSortClass] = useState('hidden'); // CSS class to show/hide/rotate the sort icon.
  const [filterClass, setFilterClass] = useState(''); // CSS class to indicate if a filter is applied.
  const sortIndexRef = useRef(0); // Tracks the current sort state (0: none, 1: asc, 2: desc).
  const [filterText, setFilterText] = useState(''); // The current text in the filter input.
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // Ref to hold the debounce timer.

  // Closes the filter input.
  const closeInput = () => {
    setIsInputVisible(false);
  };

  // Toggles the visibility of the filter input.
  const toggleInput = () => {
    setIsInputVisible((prev) => !prev);
  };

  // Maps sort index to sort order and icon class.
  const sortCycleMap: Record<number, ['asc' | 'desc' | null, string]> = {
    0: [null, 'hidden'],
    1: ['asc', ''],
    2: ['desc', 'rotate-180'],
  };

  /**
   * Handles changes to the filter input with a 500ms debounce to avoid excessive API calls.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFilterText(value);

    // Clear the previous debounce timer
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new debounce timer
    debounceTimeout.current = setTimeout(async () => {
      value ? setFilterClass('Applied') : setFilterClass('');
      await onSearch(requestName, column.colId, value, summaryType);
    }, 500);
  };

  /**
   * Cycles through the sort states (none -> ascending -> descending) on click.
   */
  const handleSortClick = () => {
    if (!enableSorting || !setSort) return;
    sortIndexRef.current = (sortIndexRef.current + 1) % 3;
    const [sortOrder, sortClassType] = sortCycleMap[sortIndexRef.current];
    setSort(sortOrder);
    setSortClass(sortClassType);
  };

  // Effect to clear the filter when the parent component sends a signal.
  useEffect(() => {
    if (clearSignal > 0) {
      setFilterText('');
      setFilterClass('');
      setIsInputVisible(false);
    }
  }, [clearSignal]);

  // Effect to add/remove event listeners for closing the filter input.
  // These are only active when the input is visible for performance.
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

  // Effect to clear the sort when the parent component sends a signal.
  useEffect(() => {
    if (clearSortSignal > 0) {
      sortIndexRef.current = 0;
      setSortClass('hidden');
    }
  }, [clearSortSignal]);

  return (
    <div ref={filterBoxRef} className="grid grid-cols-3 h-full w-full relative px-1">
      {/* Default view: Column name and filter/sort icons */}
      {!isInputVisible && (
        <>
          <div />
          <div
            className="font-semibold cursor-pointer flex justify-center items-center"
            onClick={handleSortClick}
            title="Click to sort"
          >
            {displayName}
          </div>
          <button
            onClick={toggleInput}
            className="ml-1 text-gray-600 hover:text-black focus:outline-none flex justify-end items-center"
            title="Filter"
          >
            <div className="flex">
              <img className={sortClass} src="sort.png" width="16px" alt="Sort" />
              <img src={`filter${filterClass}.png`} width="16px" className="min-w-4 bg-gray-100" alt="Filter" />
            </div>
          </button>
        </>
      )}

      {/* View when filtering: Show the input box */}
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