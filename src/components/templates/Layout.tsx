import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '../organisms/Navigation';
import Footer from '../organisms/Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;