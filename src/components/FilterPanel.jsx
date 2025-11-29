/**
 * FilterPanel Component
 * Reusable filter panel for products and orders
 * Integrated with Redux for state management
 */

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectFilters,
  setFilters,
  clearFilters,
  applyFilters,
  selectCategories,
} from "../store/slices/productsSlice";
import "./FilterPanel.css";

const FilterPanel = ({ type = "products" }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const categories = useSelector(selectCategories);

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value }));
    dispatch(applyFilters());
  };

  const handlePriceRangeChange = (e, index) => {
    const newRange = [...filters.priceRange];
    newRange[index] = Number(e.target.value);
    dispatch(setFilters({ priceRange: newRange }));
    dispatch(applyFilters());
  };

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value }));
    dispatch(applyFilters());
  };

  const handleInStockChange = (e) => {
    dispatch(setFilters({ inStock: e.target.checked }));
    dispatch(applyFilters());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="btn-clear-filters" onClick={handleClearFilters}>
          Clear All
        </button>
      </div>

      <div className="filter-section">
        <label className="filter-label">Category</label>
        <select
          className="filter-select"
          value={filters.category}
          onChange={handleCategoryChange}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Price Range</label>
        <div className="price-range-inputs">
          <input
            type="number"
            className="filter-input"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceRangeChange(e, 0)}
          />
          <span className="price-separator">-</span>
          <input
            type="number"
            className="filter-input"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceRangeChange(e, 1)}
          />
        </div>
        <div className="price-range-slider">
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceRangeChange(e, 1)}
            className="slider"
          />
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Sort By</label>
        <select
          className="filter-select"
          value={filters.sortBy}
          onChange={handleSortChange}
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price (Low to High)</option>
          <option value="price-high">Price (High to Low)</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={handleInStockChange}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      <div className="filter-footer">
        <div className="filter-count">Showing filtered results</div>
      </div>
    </div>
  );
};

export default FilterPanel;
