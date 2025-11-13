import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';
import './LoginPage.css';

const initialFormState = {
  email: '',
  password: '',
};

const validate = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
};

const getErrorMessage = (error) => {
  if (!error) return 'Login failed. Please try again.';

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

    return `Login failed: ${status} ${statusText}`;
  }

  if (request) {
    return 'Unable to connect to server. Please check your connection.';
  }

  return message || 'Login failed. Please try again.';
};

const parseToken = (token) => {
  if (typeof token === 'string') {
    if (token.startsWith('"') && token.endsWith('"')) {
      try {
        return JSON.parse(token);
      } catch (err) {
        console.error('Unable to parse token:', err);
      }
    }
    return token;
  }

  if (token && typeof token === 'object') {
    return token.token || token.Token || null;
  }

  return null;
};

const LoginPage = () => {
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitCount, setSubmitCount] = useState(0);
  const navigate = useNavigate();

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

      const { data } = await api.post('/Users/signin', {
        email: form.email,
        password: form.password,
      });

      const token = parseToken(data);

      if (!token) {
        throw new Error('Invalid token received from server.');
      }

      setAuthToken(token);

      setStatus({ type: 'success', message: '' });
      setForm(initialFormState);
      setSubmitCount(0);
      navigate('/products', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setStatus({
        type: 'error',
        message: getErrorMessage(err),
      });
    }
  };

  return (
    <div className="login-page">
      <h1>Welcome back</h1>
      <p className="login-subtitle">Enter your credentials to access your account.</p>

      <form className="login-form form" onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
            disabled={isSubmitting}
            required
            className="form__input"
          />
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </label>

        <button type="submit" className="btn btn--primary btn--full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {status.type === 'error' ? (
        <p className="status-message status-message--error">{status.message}</p>
      ) : null}

      <p className="login-footer text-muted">
        Need an account? <a href="/register">Create one</a>
      </p>
    </div>
  );
};

export default LoginPage;

