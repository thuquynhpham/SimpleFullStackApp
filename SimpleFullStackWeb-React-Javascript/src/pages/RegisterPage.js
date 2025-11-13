import { useMemo, useState } from 'react';
import api from '../services/api';
import './RegisterPage.css';

const initialFormState = {
  name: '',
  email: '',
  password: '',
};

const validate = ({ name, email, password }) => {
  const errors = {};

  if (!name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
};

const getErrorMessage = (error) => {
  if (!error) return 'Registration failed. Please try again.';
  const { response, request, message } = error;

  if (response) {
    const { data, status, statusText } = response;

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data.message === 'string') {
      return data.message;
    }

    if (data && typeof data.title === 'string') {
      return data.title;
    }

    return `Registration failed: ${status} ${statusText}`;
  }

  if (request) {
    return 'Unable to connect to server. Please check your connection.';
  }

  return message || 'Registration failed. Please try again.';
};

const RegisterPage = () => {
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitCount, setSubmitCount] = useState(0);

  const errors = useMemo(() => (submitCount === 0 ? {} : validate(form)), [form, submitCount]);
  const isSubmitting = status.type === 'loading';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitCount((count) => count + 1);

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setStatus({ type: 'loading', message: '' });

      await api.post('/Users/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setStatus({
        type: 'success',
        message: 'Account created successfully. You can now sign in.',
      });
      setForm(initialFormState);
      setSubmitCount(0);
    } catch (err) {
      console.error('Registration error:', err);
      setStatus({
        type: 'error',
        message: getErrorMessage(err),
      });
    }
  };

  return (
    <div className="register-page">
      <h1>Create your account</h1>
      <p className="register-subtitle">Enter your details to register for access.</p>

      <form className="register-form form" onSubmit={handleSubmit} noValidate>
        <label className="form__field">
          <span className="form__label">Name</span>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            disabled={isSubmitting}
            required
            className="form__input"
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </label>

        <label className="form__field">
          <span className="form__label">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={isSubmitting}
            required
            className="form__input"
          />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </label>

        <label className="form__field">
          <span className="form__label">Password</span>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            disabled={isSubmitting}
            required
            className="form__input"
          />
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </label>

        <button type="submit" className="btn btn--primary btn--full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {status.type === 'success' ? (
        <p className="status-message status-message--success">{status.message}</p>
      ) : null}
      {status.type === 'error' ? (
        <p className="status-message status-message--error">{status.message}</p>
      ) : null}

      <p className="register-footer text-muted">
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
};

export default RegisterPage;

