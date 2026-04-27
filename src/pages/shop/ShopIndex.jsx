import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { shopAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useFlash } from "../../context/FlashContext";
import ScrollReveal from "../../components/ScrollReveal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5174";

const ShopIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showFlash } = useFlash();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState([
    "T-Shirt",
    "Shirt",
    "Hoodie",
    "Kurthi",
    "Dress",
    "Jeans",
  ]);
  const [genders] = useState(["Men", "Women", "Unisex"]);
  const [sizes] = useState(["XS", "S", "M", "L", "XL", "XXL"]);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    gender: searchParams.get("gender") || "",
    size: searchParams.get("size") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  });

  useEffect(() => {
    // Update filters state when URL params change
    setFilters({
      category: searchParams.get("category") || "",
      gender: searchParams.get("gender") || "",
      size: searchParams.get("size") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
    });
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await shopAPI.getProducts(params);
      setProducts(response.data.products || []);
    } catch (error) {
      showFlash("Failed to load products", "error");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const applyPriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (filters.minPrice) newParams.set("minPrice", filters.minPrice);
    else newParams.delete("minPrice");
    if (filters.maxPrice) newParams.set("maxPrice", filters.maxPrice);
    else newParams.delete("maxPrice");
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams({});
    setFilters({
      category: "",
      gender: "",
      size: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    });
  };

  return (
    <div className="container-fluid px-4 my-5 py-4">
      <ScrollReveal>
        <div className="row mb-5 text-center">
          <div className="col-md-8 mx-auto">
            <h1 className="display-4 fw-bold mb-3">Shop Ready-Made Designs</h1>
            <p className="lead text-muted">
              Browse our exclusive collection of pre-designed clothing. Quality
              materials and expert craftsmanship in every piece.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {!filters.gender && (
        <div className="row mb-5">
          <div className="col-md-6 mb-4">
            <ScrollReveal delay="delay-1">
              <div className="card h-100 overflow-hidden border-0 shadow-lg rounded-4">
                <div className="position-relative">
                  <img
                    src={`${API_BASE_URL}/images/mens-collection-banner.webp`}
                    className="img-fluid w-100"
                    alt="Men's Collection"
                  />
                  <div
                    className="position-absolute bottom-0 start-0 w-100 h-50"
                    style={{ backgroundColor: "rgba(31, 26, 23, 0.38)" }}
                  ></div>
                  <div className="position-absolute bottom-0 start-0 p-4">
                    <Link
                      to="/shop?gender=Men"
                      className="btn btn-light px-4 fw-bold"
                    >
                      Shop Men
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <div className="col-md-6 mb-4">
            <ScrollReveal delay="delay-2">
              <div className="card h-100 overflow-hidden border-0 shadow-lg rounded-4">
                <div className="position-relative">
                  <img
                    src={`${API_BASE_URL}/images/womens-collection-banner.webp`}
                    className="img-fluid w-100"
                    alt="Women's Collection"
                  />
                  <div
                    className="position-absolute bottom-0 start-0 w-100 h-50"
                    style={{ backgroundColor: "rgba(31, 26, 23, 0.38)" }}
                  ></div>
                  <div className="position-absolute bottom-0 start-0 p-4">
                    <Link
                      to="/shop?gender=Women"
                      className="btn btn-light px-4 fw-bold"
                    >
                      Shop Women
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {filters.gender === "Men" && (
        <ScrollReveal delay="delay-1">
          <div className="row mb-5">
            <div className="col-md-12">
              <div className="card overflow-hidden shadow border-0 rounded-4">
                <div className="position-relative">
                  <img
                    src={`${API_BASE_URL}/images/mens-collection-banner.webp`}
                    className="img-fluid w-100"
                    alt="Men's Collection"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 w-100 h-100"
                    style={{ backgroundColor: "rgba(31, 26, 23, 0.34)" }}
                  ></div>
                  <div className="position-absolute top-50 start-0 translate-middle-y p-5">
                    <h2 className="display-4 fw-bold text-white mb-0">
                      Men's Collection
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {filters.gender === "Women" && (
        <ScrollReveal delay="delay-1">
          <div className="row mb-5">
            <div className="col-md-12">
              <div className="card overflow-hidden shadow border-0 rounded-4">
                <div className="position-relative">
                  <img
                    src={`${API_BASE_URL}/images/womens-collection-banner.webp`}
                    className="img-fluid w-100"
                    alt="Women's Collection"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 w-100 h-100"
                    style={{ backgroundColor: "rgba(31, 26, 23, 0.34)" }}
                  ></div>
                  <div className="position-absolute top-50 start-0 translate-middle-y p-5">
                    <h2 className="display-4 fw-bold text-white mb-0">
                      Women's Collection
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-md-3 mb-4">
          <ScrollReveal delay="delay-2">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header">
                <h3 className="h5 mb-0">Filters</h3>
              </div>
              <div className="card-body">
                {/* Category Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Category</label>
                  <div className="d-grid gap-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="category"
                        id="categoryAll"
                        checked={!filters.category}
                        onChange={() => handleFilterChange("category", "")}
                      />
                      <label className="form-check-label" htmlFor="categoryAll">
                        All Categories
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div className="form-check" key={category}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="category"
                          id={`category${category}`}
                          checked={filters.category === category}
                          onChange={() =>
                            handleFilterChange("category", category)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`category${category}`}
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <hr />

                {/* Gender Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Gender</label>
                  <div className="d-grid gap-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gender"
                        id="genderAll"
                        checked={!filters.gender}
                        onChange={() => handleFilterChange("gender", "")}
                      />
                      <label className="form-check-label" htmlFor="genderAll">
                        All
                      </label>
                    </div>
                    {genders.map((gender) => (
                      <div className="form-check" key={gender}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          id={`gender${gender}`}
                          checked={filters.gender === gender}
                          onChange={() => handleFilterChange("gender", gender)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`gender${gender}`}
                        >
                          {gender}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <hr />

                {/* Size Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Size</label>
                  <div className="d-grid gap-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="size"
                        id="sizeAll"
                        checked={!filters.size}
                        onChange={() => handleFilterChange("size", "")}
                      />
                      <label className="form-check-label" htmlFor="sizeAll">
                        All Sizes
                      </label>
                    </div>
                    {sizes.map((size) => (
                      <div className="form-check" key={size}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="size"
                          id={`size${size}`}
                          checked={filters.size === size}
                          onChange={() => handleFilterChange("size", size)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`size${size}`}
                        >
                          {size}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <hr />

                {/* Price Range Filter */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Price Range</label>
                  <div className="row g-2">
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, minPrice: e.target.value })
                        }
                        min="0"
                      />
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, maxPrice: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="d-grid mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={applyPriceFilter}
                    >
                      Apply Price
                    </button>
                  </div>
                </div>

                <hr />

                {/* Reset Filters */}
                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetFilters}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Products Grid */}
        <div className="col-md-9">
          <ScrollReveal delay="delay-3">
            {/* Sort Options */}
            <div className="card shadow-sm mb-4 border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">
                      {products.length} products found
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <label className="me-2">Sort by:</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.sort}
                      onChange={(e) =>
                        handleFilterChange("sort", e.target.value)
                      }
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low-high">Price: Low to High</option>
                      <option value="price-high-low">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Products */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="alert alert-info">
              No products found matching your filters. Try adjusting your search
              criteria.
            </div>
          ) : (
            <div className="row">
              {products.map((product, index) => (
                <div className="col-md-4 mb-4" key={product._id}>
                  <ScrollReveal delay={`delay-${(index % 3) + 1}`}>
                    <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                      <img
                        src={`${API_BASE_URL}${
                          product.images?.[0] || "/images/casual-tshirt.jpeg"
                        }`}
                        className="card-img-top"
                        alt={product.name}
                        style={{
                          height: "250px",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        onError={(e) => {
                          // Prevent infinite loop by checking if already using fallback
                          if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = "true";
                            e.target.src = `${API_BASE_URL}/images/casual-tshirt.jpeg`;
                          }
                        }}
                      />
                      <div className="card-body d-flex flex-column bg-white">
                        <h5 className="card-title fw-bold mb-1">
                          {product.name}
                        </h5>
                        <p className="card-text text-muted small mb-3">
                          {product.category} • {product.gender}
                        </p>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-end mb-3">
                            <span className="h5 mb-0 text-primary fw-bold">
                              {formatPrice(product.price)}
                            </span>
                            {product.sizes && product.sizes.length > 0 && (
                              <small className="text-muted bg-light px-2 py-1 rounded">
                                {product.sizes.length} Sizes
                              </small>
                            )}
                          </div>
                          <Link
                            to={`/shop/product/${product._id}`}
                            className="btn btn-primary w-100 fw-bold"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ShopIndex;
