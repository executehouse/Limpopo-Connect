import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import '@testing-library/jest-dom';

describe('Header Component', () => {
  test('should highlight the active navigation link', () => {
    // Render the Header component with initial route '/'
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // Check that the "Home" link is active
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('active-nav-link');

    // Check that another link (e.g., Events) is not active
    const eventsLink = screen.getByRole('link', { name: 'Events' });
    expect(eventsLink).not.toHaveClass('active-nav-link');
  });

  test('should change active link on navigation', () => {
    // Render the Header component with initial route '/events'
    render(
      <MemoryRouter initialEntries={['/events']}>
        <Header />
      </MemoryRouter>
    );

    // Check that the "Events" link is active
    const eventsLink = screen.getByRole('link', { name: 'Events' });
    expect(eventsLink).toHaveClass('active-nav-link');

    // Check that the "Home" link is not active
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).not.toHaveClass('active-nav-link');
  });
});