import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

const emptyForm = {
  sku: '',
  name: '',
  price: 0,
  quantity: 0,
};

const ProductFormModal = ({ visible, initialProduct, loading, error, title, onCancel, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);

  const currentInitial = useMemo(() => initialProduct, [initialProduct]);

  useEffect(() => {
    if (visible) {
      if (currentInitial) {
        setForm({
          sku: currentInitial.sku ?? '',
          name: currentInitial.name ?? '',
          price: Number(currentInitial.price ?? 0),
          quantity: Number(currentInitial.quantity ?? 0),
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [visible, currentInitial]);

  if (!visible) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      sku: typeof form.sku === 'string' ? form.sku.trim() : '',
      name: typeof form.name === 'string' ? form.name.trim() : '',
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onCancel} />
      <div className="modal__content">
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
        </header>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form__field">
            <label className="form__label" htmlFor="sku">
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              className="form__input"
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form__input"
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="price">
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              className="form__input"
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="quantity">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              required
              className="form__input"
            />
          </div>
          {error ? <p className="alert alert--error">{error}</p> : null}
          <footer className="modal__actions">
            <button className="btn btn--primary btn--sm" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn--ghost btn--sm" type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

ProductFormModal.propTypes = {
  visible: PropTypes.bool,
  initialProduct: PropTypes.shape({
    sku: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
};

ProductFormModal.defaultProps = {
  visible: false,
  initialProduct: null,
  loading: false,
  error: '',
  title: 'Product Form',
  onCancel: () => {},
  onSubmit: () => {},
};

export default ProductFormModal;
