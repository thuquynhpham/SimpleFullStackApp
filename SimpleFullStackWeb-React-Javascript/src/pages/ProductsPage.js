import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './ProductsPage.css';

const emptyForm = {
  sku: '',
  name: '',
  price: '',
  quantity: '',
};

const ProductsPage = () => {
  const API_BASE_URL = 'https://localhost:7279/api';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term),
    );
  }, [products, search]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE_URL}/Products`);
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setProducts(items);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Unable to load products. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSubmitStatus('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextProduct = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    if (!nextProduct.sku || !nextProduct.name) {
      setError('SKU and name are required.');
      return;
    }

    if (!Number.isFinite(nextProduct.price) || nextProduct.price < 0) {
      setError('Price must be a positive number.');
      return;
    }

    if (!Number.isInteger(nextProduct.quantity) || nextProduct.quantity < 0) {
      setError('Quantity must be a whole number.');
      return;
    }

    try {
      setError('');
      setSubmitStatus('Saving…');
      await axios.post(`${API_BASE_URL}/Products`, nextProduct);
      setForm(emptyForm);
      setSubmitStatus('Product saved successfully.');
      await fetchProducts();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Unable to save product. Please try again later.',
      );
      setSubmitStatus('');
    }
  };

  return (
    <div className="products-page">
      <header>
        <h1>Products</h1>
        <p className="products-subtitle">Track and add inventory items quickly.</p>
      </header>

      <section className="products-search">
        <label>
          Search
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by SKU or name"
          />
        </label>
      </section>

      <section className="products-form">
        <h2>Add product</h2>
        <form onSubmit={handleSubmit}>
          <label>
            SKU
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU-1004"
              required
            />
          </label>
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              required
            />
          </label>
          <label>
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </label>
          <label>
            Quantity
            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </label>
          <button type="submit">Add product</button>
        </form>
        {error ? <p className="products-error">{error}</p> : null}
        {submitStatus ? <p className="products-status">{submitStatus}</p> : null}
      </section>

      <section className="products-table">
        <h2>Inventory</h2>
        {loading ? (
          <p className="products-loading">Loading products…</p>
        ) : filteredProducts.length ? (
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>${Number(product.price ?? 0).toFixed(2)}</td>
                  <td>{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="products-empty">No products match your search.</p>
        )}
      </section>
    </div>
  );
};

export default ProductsPage;

