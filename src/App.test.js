import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders both curve links', () => {
  const { getAllByText } = render(<App />);
  expect(getAllByText(/two points curve/i).length).toBeGreaterThan(0);
  expect(getAllByText(/three points curve/i).length).toBeGreaterThan(0);
});

test('the landing page has a heading and coordinate fields filled in', () => {
  const { getByRole, getByLabelText } = render(<App />);
  expect(getByRole('heading', { level: 1 })).toHaveTextContent(/two points curve/i);
  expect(getByLabelText('pt1 X')).toHaveValue(120);
  expect(getByLabelText('pt1 Y')).toHaveValue(40);
});
