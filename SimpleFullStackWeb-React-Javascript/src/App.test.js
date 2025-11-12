import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

test('renders register heading', () => {
  renderWithRouter(<App />);
  expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
});
