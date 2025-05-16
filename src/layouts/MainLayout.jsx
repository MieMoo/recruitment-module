// src/layouts/MainLayout.jsx
import React from 'react';
import Navbar from '../components/Navbar';

export default function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
