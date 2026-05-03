import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AUTH_ROUTES = ['/login', '/register'];

export default function Layout() {
  const location = useLocation();
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Hide navbar on auth pages — they have their own full-screen layout */}
      {!isAuthPage && <Navbar />}

      <main className={isAuthPage ? '' : 'main-content'}>
        <Outlet />
      </main>

      {!isAuthPage && <Footer />}

      {/* Cursor Glow */}
      <div
        className="cursor-glow"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Grain Texture */}
      <div className="grain-overlay" />
    </>
  );
}
