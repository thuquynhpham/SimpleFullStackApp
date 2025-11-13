import PropTypes from 'prop-types';

const ConfirmDialog = ({ visible, title, message, loading, error, onCancel, onConfirm }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onCancel} />
      <div className="modal__content">
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
        </header>
        <p className="modal__message">{message}</p>
        {error ? <p className="alert alert--error">{error}</p> : null}
        <footer className="modal__actions">
          <button className="btn btn--danger btn--sm" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
          <button className="btn btn--ghost btn--sm" type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

ConfirmDialog.defaultProps = {
  visible: false,
  title: 'Confirm',
  message: '',
  loading: false,
  error: '',
  onCancel: () => {},
  onConfirm: () => {},
};

export default ConfirmDialog;
