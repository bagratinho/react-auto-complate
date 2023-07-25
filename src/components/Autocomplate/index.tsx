
import React from 'react';
import './style/index.css';
import { useDebounce } from './hooks/useDebounce';


export type ISuggestion = {
  id: string;
  value: string;
}

export type IAutosuggestError = {
  message: string;
}

interface IAutocomplateProps {
  value: string;
  onSelect: (value: string) => void;
  dataEndpoint: string;
  itemKey?: string;
  limitResults?: number;
  filterFunction?: (item: string, query: string) => boolean;
}

const Autocomplate = (props: IAutocomplateProps) => {
  const componentRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const defaultLimitAmount = 10;

  const [query, setQuery] = React.useState<string>(props.value);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [suggestions, setSuggestions] = React.useState<ISuggestion[]>([]);
  const [currentSuggestionQuery, setCurrentSuggestionsQuery] = React.useState<string>("");
  const [error, setError] = React.useState<IAutosuggestError | undefined>();
  const [focusedItemId, setFocusedItemId] = React.useState<string | undefined>();

  // useDeferredValue could've been used instead useDebounce for almost similar outcome
  // const deferredQuery = React.useDeferredValue(query);

  const deferredQuery = useDebounce(query, 500);
  const [isInputFocused, setIsInputFocused] = React.useState(false);

  React.useEffect(() => {
    if (deferredQuery !== "") {
      handleSearch(deferredQuery.toLowerCase());
    } 
  }, [deferredQuery])

  // the effect above handles arrow key navigation through suggestions and enter case for selecting
  React.useEffect(() => {
    const setFocusedItem = (isNext: boolean) => {
      const currentFocusedItemIndex = focusedItemId ? 
        suggestions.findIndex((item: ISuggestion) => item.id === focusedItemId) : 
        isNext ? -1 : suggestions.length;
      const nextFocusedItemIndex = 
        currentFocusedItemIndex === suggestions.length - 1 && isNext ? 0 : 
        currentFocusedItemIndex === 0 && !isNext ? suggestions.length - 1 : 
        currentFocusedItemIndex + (isNext ? 1 : -1);
        
      setFocusedItemId(suggestions[nextFocusedItemIndex].id);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInputFocused || !suggestions.length) { return; }
      switch (e.key) {
        case "ArrowDown": 
          e.preventDefault();
          setFocusedItem(true);
          break;
        case "ArrowUp": 
          e.preventDefault();
          setFocusedItem(false);
          break;
        case "Enter":
          const item = suggestions.find((item: ISuggestion) => item.id === focusedItemId);
          if (item) {
            handleItemPick(item!)();
          }
          break;
        default: 
          break;  
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  })

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(e.target as any)) {
        setIsInputFocused(false);
        setFocusedItemId(undefined);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [componentRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFocusedItemId(undefined);
    setQuery(e.target.value);
  }

  const handleFocus = () => setIsInputFocused(true);

  const handleItemPick = (item: ISuggestion) => () => {
    setQuery(item.value);
    props.onSelect(item.value);
    inputRef!.current!.blur();
    setFocusedItemId(undefined);
    setIsInputFocused(false);
  }

  const handleSearch = React.useCallback(async (value: string) => {
    setSuggestions([]);
    setError(undefined);
    setIsFetching(true);
    try {
      // api call loads same results on each call, but in a real world example
      // the fetch would take search query as a paramter and would return
      // already filtered list from the backend, and filtering on frontend would not be
      // needed and netwrok call would been much more efficient and specific

      const list = 
        await fetch(props.dataEndpoint,
          {
            method: "GET",
            cache: "no-store",
          }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Server error");
          }
          return response.json();
        })

      // ability to specify custom filter function for more flexibility
      const ff = props.filterFunction || filterFunction;
      const filteredList = list.filter((item: ISuggestion) => 
        ff(item.value, value)).slice(0, props.limitResults || defaultLimitAmount);
      setSuggestions(filteredList);
    } catch (e: any) {
      setError({ message: e.message })
    } finally {
      setIsFetching(false);
    }
  }, [props.filterFunction, props.limitResults]);

  const filterFunction = React.useCallback((item: string, query: string) => item.toLowerCase().includes(query.toLowerCase()), []);

  const getHighlightedText = (value: string) => {
    const substringStartIndex = value.indexOf(query);
    const substringEndIndex = substringStartIndex + query.length;
    const part1 = value.substring(0, substringStartIndex);
    const part2 = value.substring(substringStartIndex, substringEndIndex);
    const part3 = value.substring(substringEndIndex, value.length);
    return <>{part1}<span>{part2}</span>{part3}</>;
  }

  const getSuggestions = () => {
    if (!isInputFocused) { return null; }

    if (error) { return <div className="top-offset error">{error.message}</div> } 
    if (isFetching) { return <div className="top-offset loading">Loading</div> }

    const list = suggestions.map((item: ISuggestion) => {
      return (
        <li 
          key={item.id}
          onClick={handleItemPick(item)}
          className={item.id === focusedItemId ? "highlight" : ""}
        >
          {getHighlightedText(item.value)}
        </li>
      );
    });
    return deferredQuery && deferredQuery === query && suggestions.length ? <ul className="top-offset">{list}</ul> : null;
  }

  return (
    <div 
      ref={componentRef} 
      className="autocomplate-wrapper"
    >
      <input
        ref={inputRef}
        type="text" 
        value={query} 
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="Type to search..." 
      />
      {getSuggestions()}
    </div>
  );
};

export default Autocomplate;
