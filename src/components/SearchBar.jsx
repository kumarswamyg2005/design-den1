/**
 * SearchBar Component
 * Reusable search bar with Redux integration
 * Used for searching products, orders, and users
 */

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "./SearchBar.css";

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  debounceTime = 500,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceTime, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
