import next from 'next';
import React, { useRef } from 'react';
import { useTradeData } from '../hooks/UseTradeData';
const CustomFilter = (props: any) => {
  const {
    displayName,
    column,
    api,
    setSort,
    enableSorting,
    columnApi,
    sort,
    tableName,
    onSearch,
    currentFilterCol,
    filter
  } = props;
  const filterBoxRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const showInputRef = useRef<boolean>(false);
  const [renderTrigger, setRenderTrigger] = React.useState(0); // Used to trigger re-render
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [sortClass, setSortClass] = React.useState("hidden");
  const [filterClass, setFilterClass] = React.useState("");
  const sortIndexRef = useRef(0); // ✅ persistent between renders
  const [filterText, setFilterText] = React.useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const closeInput = () => {
  if (!hasMountedRef.current) return;
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
          setFilterClass("Applied")
            await onSearch(tableName, value, column.colId, filter); // Make backend call
            setRenderTrigger(prev => prev + 1);
        }, 350); // debounce duration
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
  hasMountedRef.current = true; // allow closeInput after initial mount

  // 🔁 Delay focus to avoid AG Grid re-render stealing it
  const timeout = setTimeout(() => {
    if (showInputRef.current && inputRef.current) {
      inputRef.current.focus();
    }
  }, 10);

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



  return (
    <div ref={filterBoxRef} className="flex items-center justify-between h-full w-full relative px-1">
      {!showInputRef.current && (<div
        className={`font-semibold truncate cursor-pointer`}
        onClick={handleSortClick}
        title="Click to sort"
      >
        {displayName}
      </div>)}

      {!showInputRef.current && (<button
        onClick={toggleInput}
        className="ml-1 text-gray-600 hover:text-black focus:outline-none"
        title="Filter"
      >
        <div className='flex'>
        <img className={`${sortClass}`} src="sort.png" width="16px"/>
        <img src={`filter${filterClass}.png`} width="16px" />
        </div>
      </button>)}

      {showInputRef.current  && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={filterText}
          onChange={onFilterChange}
          className="absolute top-0 left-0 z-10 w-full h-[calc(70%)] px-2 py-1 text-sm text-black bg-white border focus:outline-blue-500 rounded shadow-md"
        />
      )}
    </div>
  );
};

export default CustomFilter;
