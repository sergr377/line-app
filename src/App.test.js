import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders both curve links', () => {
  const { getByText } = render(<App />);
  expect(getByText(/two points curve/i)).toBeInTheDocument();
  expect(getByText(/three points curve/i)).toBeInTheDocument();
});
