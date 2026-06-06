import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api/axios';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/routes/ProtectedRoute';
import GuestRoute from './components/routes/GuestRoute';

import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import DestinationPage from './pages/DestinationPage';
import SearchPage from './pages/SearchPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import NotFoundPage from './pages/NotFoundPage';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
          <Route path="/discover" element={<AnimatedPage><DiscoverPage /></AnimatedPage>} />
          <Route path="/search" element={<AnimatedPage><SearchPage /></AnimatedPage>} />
          <Route path="/destinations/:id" element={<AnimatedPage><DestinationPage /></AnimatedPage>} />

          {/* Protected Routes */}
          <Route path="/trips" element={<ProtectedRoute><AnimatedPage><TripsPage /></AnimatedPage></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><AnimatedPage><TripDetailPage /></AnimatedPage></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><AnimatedPage><BookingsPage /></AnimatedPage></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AnimatedPage><ProfilePage /></AnimatedPage></ProtectedRoute>} />

          {/* Guest-Only Routes */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* 404 Catch-All */}
          <Route path="/auth/callback" element={<AnimatedPage><AuthCallback /></AnimatedPage>} />
          <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    // Wake up Azure App Service as early as possible
    api.get('/ping').catch((err) => console.error('Ping error:', err));
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181B',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#18181B',
            },
          },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
