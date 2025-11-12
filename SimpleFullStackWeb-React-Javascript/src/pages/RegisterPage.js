import { useMemo, useState } from 'react';
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
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStatus({
        type: 'success',
        message: 'Account created successfully. You can now sign in.',
      });
      setForm(initialFormState);
      setSubmitCount(0);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || 'Unable to create account right now. Try again later.',
      });
    }
  };

  return (
    <div className="register-page">
      <h1>Create your account</h1>
      <p className="register-subtitle">Enter your details to register for access.</p>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <label>
          Name
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            disabled={isSubmitting}
            required
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </label>

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
            autoComplete="new-password"
            disabled={isSubmitting}
            required
          />
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {status.type === 'success' ? (
        <p className="status-message status-message--success">{status.message}</p>
      ) : null}
      {status.type === 'error' ? (
        <p className="status-message status-message--error">{status.message}</p>
      ) : null}

      <p className="register-footer">
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
};

export default RegisterPage;

