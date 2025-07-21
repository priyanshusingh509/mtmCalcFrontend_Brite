import next from 'next';
import React, { useRef } from 'react';
import { useTradeData } from '../hooks/UseTradeData';
const CustomFilter = (props: any) => {
  const {
    displayName,
    column,
    setSort,
    enableSorting,
    requestName,
    onSearch,
    currentFilterCol,
    summaryType,
    clearSignal,
    clearSortSignal
  } = props;
  const filterBoxRef = useRef<HTMLDivElement>(null);
  const showInputRef = useRef<boolean>(false);
  const [renderTrigger, setRenderTrigger] = React.useState(0); // Used to trigger re-render
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [sortClass, setSortClass] = React.useState("hidden");
  const [filterClass, setFilterClass] = React.useState("");
  const sortIndexRef = useRef(0); // ✅ persistent between renders
  const [filterText, setFilterText] = React.useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  

  const closeInput = () => {
  showInputRef.current = false;
  setRenderTrigger(prev => prev + 1);
};


  const sortCycleMap: Record<number, ['asc', ""] | ['desc', "rotate-180"] | [null, "hidden"]> = {
    0: [null, "hidden"],
    1: ['asc', ""],
    2: ['desc', "rotate-180"],
  };
    const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        console.log(value);
        setFilterText(value);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
          value ? setFilterClass("Applied") : setFilterClass('');
            await onSearch(requestName, column.colId, value, summaryType); // Make backend call
            setRenderTrigger(prev => prev + 1);
        }, 500); // debounce duration
    };

//   const toggleInput = () => setShowInput(prev => !prev);
const toggleInput = () => {
    showInputRef.current = !showInputRef.current;
    setRenderTrigger(prev => prev + 1); // Force re-render
}
  const currentColID = useRef('');
  const nextColID = useRef('');

  const handleSortClick = () => {
    console.log(column.colId);
    nextColID.current = column.colId;
    console.log(currentColID.current, nextColID.current);
    if (!(currentColID.current === nextColID.current)){
        currentColID.current = nextColID.current;
        sortIndexRef.current = 0;
        console.log("this ran1")
    }
    if (!enableSorting || !setSort) return;
    sortIndexRef.current = (sortIndexRef.current + 1) % 3;
    const [sortOrder, sortClassType] = sortCycleMap[sortIndexRef.current];
    // console.log("sortIndex:", sortIndexRef.current, "sortOrder:", sortOrder);
    setSort(sortOrder);
    setSortClass(sortClassType);
  };
React.useEffect(() => {
  // If another column is now the active filter, clear this one
  if (currentFilterCol && currentFilterCol !== column.colId) {
    setFilterText('');
    setFilterClass('');
  }
}, [currentFilterCol]);

React.useEffect(() => {
  // 🔁 Delay focus to avoid AG Grid re-render stealing it
  const timeout = setTimeout(() => {
    if (showInputRef.current && inputRef.current) {
      inputRef.current.focus();
    }
  }, 200);

  // 🔐 ESC key closes input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeInput();
    }
  };

  // 🖱️ Click outside closes input
  const handleClickOutside = (e: MouseEvent) => {
    if (
      showInputRef.current &&
      filterBoxRef.current &&
      !filterBoxRef.current.contains(e.target as Node)
    ) {
      closeInput();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    clearTimeout(timeout);
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [renderTrigger]);

React.useEffect(() => {
  setFilterText('');
  setFilterClass('');
  showInputRef.current = false;
  setRenderTrigger(prev => prev + 1); // re-render to hide input
  // setSort(null);
  // setSortClass("");
}, [clearSignal]);

React.useEffect(() => {
  sortIndexRef.current = 0;
  setSortClass("hidden");
}, [clearSortSignal]);


  return (
    <div ref={filterBoxRef} className="grid grid-cols-3 h-full w-full relative px-1">
      {!showInputRef.current && <div></div>}
      {!showInputRef.current && (<div
        className={`font-semibold cursor-pointer flex justify-center items-center`}
        onClick={handleSortClick}
        title="Click to sort"
      >
        {displayName}
      </div>)}

      {!showInputRef.current && (<button
        onClick={toggleInput}
        className="ml-1 text-gray-600 hover:text-black focus:outline-none flex justify-end items-center "
        title="Filter"
      >
        <div className='flex'>
        <img className={`${sortClass}`} src="sort.png" width="16px"/>
        <img src={`filter${filterClass}.png`} width="16px"  className='min-w-4 bg-gray-100'/>
        </div>
      </button>)}

      {showInputRef.current  && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={filterText}
          onChange={onFilterChange}
          className="absolute top-0 left-0 z-5 w-full h-[calc(70%)] px-2 py-1 text-sm text-black bg-white border focus:outline-blue-500 rounded shadow-md col-span-3"
        />
      )}
    </div>
  );
};

export default CustomFilter;
