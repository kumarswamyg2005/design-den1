/**
 * StockManager Component
 * Reusable component for managing product stock
 * Integrated with Redux for state management
 */

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateStock,
  selectProductsLoading,
} from "../store/slices/productsSlice";
import { showToast } from "../store/slices/uiSlice";
import "./StockManager.css";

const StockManager = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectProductsLoading);
  const [stockValue, setStockValue] = useState(product.stock || 0);
  const [operation, setOperation] = useState("set"); // 'set', 'add', 'subtract'

  const handleUpdate = async () => {
    let newStock = stockValue;

    if (operation === "add") {
      newStock = product.stock + stockValue;
    } else if (operation === "subtract") {
      newStock = product.stock - stockValue;
    }

    if (newStock < 0) {
      dispatch(
        showToast({
          message: "Stock cannot be negative",
          type: "error",
        })
      );
      return;
    }

    try {
      await dispatch(
        updateStock({
          id: product._id,
          stock: newStock,
        })
      ).unwrap();

      dispatch(
        showToast({
          message: "Stock updated successfully",
          type: "success",
        })
      );

      if (onClose) onClose();
    } catch (error) {
      dispatch(
        showToast({
          message: error.message || "Failed to update stock",
          type: "error",
        })
      );
    }
  };

  const handleIncrement = () => {
    setStockValue((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setStockValue((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="stock-manager">
      <div className="stock-manager-header">
        <h3>Manage Stock</h3>
        {onClose && (
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="stock-product-info">
        <img
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          className="stock-product-image"
        />
        <div className="stock-product-details">
          <h4>{product.name}</h4>
          <p className="current-stock">
            Current Stock: <strong>{product.stock}</strong>
          </p>
        </div>
      </div>

      <div className="stock-operations">
        <label className="stock-label">Operation</label>
        <div className="operation-buttons">
          <button
            className={`operation-btn ${operation === "set" ? "active" : ""}`}
            onClick={() => setOperation("set")}
          >
            Set
          </button>
          <button
            className={`operation-btn ${operation === "add" ? "active" : ""}`}
            onClick={() => setOperation("add")}
          >
            Add
          </button>
          <button
            className={`operation-btn ${
              operation === "subtract" ? "active" : ""
            }`}
            onClick={() => setOperation("subtract")}
          >
            Subtract
          </button>
        </div>
      </div>

      <div className="stock-input-section">
        <label className="stock-label">
          {operation === "set" ? "New Stock" : "Quantity"}
        </label>
        <div className="stock-input-wrapper">
          <button className="stock-btn" onClick={handleDecrement}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <input
            type="number"
            className="stock-input"
            value={stockValue}
            onChange={(e) => setStockValue(Math.max(0, Number(e.target.value)))}
            min="0"
          />
          <button className="stock-btn" onClick={handleIncrement}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="stock-preview">
        <div className="preview-label">New Stock Will Be:</div>
        <div className="preview-value">
          {operation === "set"
            ? stockValue
            : operation === "add"
            ? product.stock + stockValue
            : product.stock - stockValue}
        </div>
      </div>

      <div className="stock-actions">
        <button
          className="btn-update"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Stock"}
        </button>
        {onClose && (
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default StockManager;
