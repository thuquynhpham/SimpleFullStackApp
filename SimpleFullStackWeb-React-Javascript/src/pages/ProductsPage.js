import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';
import ProductFormModal from '../components/ProductFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import './ProductsPage.css';

const defaultState = {
  pageNum: 1,
  pageSize: 10,
  total: 0,
};

const defaultFilters = {
  search: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
};

const createDefaultFilters = () => ({ ...defaultFilters });

const emptyProduct = {
  sku: '',
  name: '',
  price: 0,
  quantity: 0,
};

const getApiError = (error, fallback) => {
  if (!error) return fallback;

  const { response } = error;
  if (response?.data) {
    const data = response.data;
    if (typeof data === 'string') return data;
    if (data && typeof data.message === 'string') return data.message;
    if (data && typeof data.title === 'string') return data.title;
  }

  return fallback;
};

const ProductsPage = ({ onReloadProfile }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [state, setState] = useState(defaultState);
  const [filters, setFilters] = useState(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(createDefaultFilters);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / state.pageSize)),
    [state.total, state.pageSize]
  );

  const buildParams = useCallback(() => {
    const params = {
      pageNum: state.pageNum,
      pageSize: state.pageSize,
      sort: appliedFilters.sortBy,
      dir: appliedFilters.sortDir,
    };

    if (appliedFilters.search.trim()) {
      params.q = appliedFilters.search.trim();
    }

    const min = parseFloat(appliedFilters.minPrice);
    if (!Number.isNaN(min)) {
      params.minPrice = min;
    }

    const max = parseFloat(appliedFilters.maxPrice);
    if (!Number.isNaN(max)) {
      params.maxPrice = max;
    }

    return params;
  }, [state.pageNum, state.pageSize, appliedFilters]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/Products', {
        params: buildParams(),
      });

      setProducts(Array.isArray(data?.items) ? data.items : []);
      setState((prev) => ({
        ...prev,
        total: data?.total ?? 0,
        pageNum: data?.pageNum ?? prev.pageNum,
        pageSize: data?.pageSize ?? prev.pageSize,
      }));
    } catch (err) {
      console.error('Load products error:', err);
      setError(getApiError(err, 'Failed to load products.'));
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setState((prev) => ({ ...prev, pageNum: 1 }));
  };

  const resetFilters = () => {
    setFilters(createDefaultFilters());
    setAppliedFilters(createDefaultFilters());
    setState({ ...defaultState });
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setState((prev) => ({ ...prev, pageNum: page }));
  };

  const changePageSize = (event) => {
    const nextSize = Number(event.target.value);
    setState({ pageNum: 1, pageSize: nextSize, total: 0 });
  };

  const startAdd = () => {
    setEditingProduct(null);
    setFormError('');
    setShowForm(true);
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormError('');
    setFormLoading(false);
  };

  const startDelete = (product) => {
    setDeletingProduct(product);
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingProduct(null);
    setDeleteError('');
    setDeleteLoading(false);
  };

  const deleteMessage = useMemo(() => {
    if (!deletingProduct) return '';
    const { name, sku } = deletingProduct;
    if (name && sku) return `Delete product "${name}" (SKU: ${sku})?`;
    if (name) return `Delete product "${name}"?`;
    if (sku) return `Delete product with SKU ${sku}?`;
    return 'Delete this product?';
  }, [deletingProduct]);

  const handleSubmit = async (payload) => {
    setFormError('');

    const nextProduct = {
      sku: typeof payload.sku === 'string' ? payload.sku.trim() : '',
      name: typeof payload.name === 'string' ? payload.name.trim() : '',
      price: Number(payload.price),
      quantity: Number(payload.quantity),
    };

    if (!nextProduct.sku || !nextProduct.name) {
      setFormError('SKU and Name are required.');
      return;
    }

    if (Number.isNaN(nextProduct.price) || nextProduct.price < 0) {
      setFormError('Price must be a positive number.');
      return;
    }

    if (!Number.isInteger(nextProduct.quantity) || nextProduct.quantity < 0) {
      setFormError('Quantity must be a whole number.');
      return;
    }

    try {
      setFormLoading(true);

      if (editingProduct) {
        await api.put(`/Products/${editingProduct.productId}`, nextProduct);
      } else {
        await api.post('/Products', nextProduct);
      }

      cancelForm();
      await loadProducts();
      if (onReloadProfile) onReloadProfile();
    } catch (err) {
      console.error('Save product error:', err);
      setFormError(getApiError(err, 'Something went wrong.'));
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct) {
      setDeleteError('No product selected.');
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete(`/Products/${deletingProduct.productId}`);
      cancelDelete();
      await loadProducts();
    } catch (err) {
      console.error('Delete product error:', err);
      setDeleteError(getApiError(err, 'Failed to delete product.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="products-page page">
      <header className="section-header">
        <h1>Products</h1>
        <div className="section-actions">
          <button className="btn btn--secondary btn--sm" type="button" onClick={startAdd}>
            Add Product
          </button>
          <button className="btn btn--ghost btn--sm" type="button" onClick={loadProducts} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <section className="card filters-grid">
        <div className="form__field form__field--wide">
          <label className="form__label" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            name="search"
            type="text"
            value={filters.search}
            onChange={handleFilterChange}
            className="form__input"
            placeholder="SKU or Name"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyFilters();
              }
            }}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="minPrice">
            Min Price
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min="0"
            step="0.01"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="form__input"
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="maxPrice">
            Max Price
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min="0"
            step="0.01"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="form__input"
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="sort">
            Sort By
          </label>
          <select id="sort" name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="form__input">
            <option value="createdAt">Created At</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="dir">
            Direction
          </label>
          <select id="dir" name="sortDir" value={filters.sortDir} onChange={handleFilterChange} className="form__input">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="pageSize">
            Page Size
          </label>
          <select
            id="pageSize"
            name="pageSize"
            value={state.pageSize}
            onChange={changePageSize}
            className="form__input"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="filters-grid__actions">
          <button className="btn btn--secondary btn--sm" type="button" onClick={applyFilters}>
            Apply
          </button>
          <button className="btn btn--ghost btn--sm" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </section>

      {error ? <p className="alert alert--error">{error}</p> : null}

      {products.length ? (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th className="table__numeric">Price</th>
                <th className="table__numeric">Quantity</th>
                <th className="table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td className="table__numeric">{product.price.toFixed(2)}</td>
                  <td className="table__numeric">{product.quantity}</td>
                  <td className="table__actions">
                    <button className="btn btn--ghost btn--sm" type="button" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button className="btn btn--danger btn--sm" type="button" onClick={() => startDelete(product)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <p className="text-muted">No products available.</p>
      ) : null}

      {state.total > 0 ? (
        <footer className="pagination">
          <div className="text-muted">
            Showing {products.length} of {state.total} product{state.total !== 1 ? 's' : ''}
          </div>
          <div className="pagination__controls">
            <button className="btn btn--ghost btn--sm" type="button" onClick={() => changePage(state.pageNum - 1)} disabled={state.pageNum === 1}>
              Previous
            </button>
            <span>
              Page {state.pageNum} of {totalPages}
            </span>
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              onClick={() => changePage(state.pageNum + 1)}
              disabled={state.pageNum === totalPages}
            >
              Next
            </button>
          </div>
        </footer>
      ) : null}

      <ProductFormModal
        visible={showForm}
        initialProduct={editingProduct || emptyProduct}
        loading={formLoading}
        error={formError}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        onCancel={cancelForm}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Product"
        message={deleteMessage}
        loading={deleteLoading}
        error={deleteError}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

ProductsPage.propTypes = {
  onReloadProfile: PropTypes.func,
};

ProductsPage.defaultProps = {
  onReloadProfile: undefined,
};

export default ProductsPage;

