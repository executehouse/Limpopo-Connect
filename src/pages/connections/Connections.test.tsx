import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Connections from '../Connections';

describe('Connections Page', () => {
  test('filters categories based on search term', () => {
    render(
      <BrowserRouter>
        <Connections />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search for connections/i);

    // Search for "friendship"
    fireEvent.change(searchInput, { target: { value: 'friendship' } });

    // Check that the "Friendship" category is visible by its heading
    expect(screen.getByRole('heading', { name: /Friendship & Activity Partners/i })).toBeInTheDocument();

    // Check that another category's heading is not visible
    // This is more specific than queryByText to avoid matching the CTA section
    expect(screen.queryByRole('heading', { name: /Meaningful Relationships/i })).not.toBeInTheDocument();
  });
});