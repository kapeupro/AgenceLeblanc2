import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../styles/globals.css';

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  ),
});
