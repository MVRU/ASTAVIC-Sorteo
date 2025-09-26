import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza la vista publica con el titulo Sorteos', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /Sorteos/i });
  expect(heading).toBeInTheDocument();
});
