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

      const token = data;
      setAuthToken(token);

      setStatus({ type: null, message: '' });
      setForm(initialFormState);
      setSubmitCount(0);
      navigate('/products', { replace: true });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || err?.response?.data || 'Unable to sign in right now. Try again later.',
      });
    }
  };

  return (
    <div className="login-page">
      <h1>Welcome back</h1>
      <p className="login-subtitle">Enter your credentials to access your account.</p>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={isSubmitting}
            required
          />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </label>

        <label>
          Password
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            disabled={isSubmitting}
            required
          />
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {status.type === 'success' ? (
        <p className="status-message status-message--success">{status.message}</p>
      ) : null}
      {status.type === 'error' ? (
        <p className="status-message status-message--error">{status.message}</p>
      ) : null}

      <p className="login-footer">
        Need an account? <a href="/register">Create one</a>
      </p>
    </div>
  );
};

export default LoginPage;

