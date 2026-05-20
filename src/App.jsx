import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar/Navbar';
import Landing from './pages/Landing/Landing';
import SignIn from './pages/SignIn/SignIn';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateSplit from './pages/CreateSplit/CreateSplit';
import SplitDetail from './pages/SplitDetail/SplitDetail';
import ConfirmShare from './pages/ConfirmShare/ConfirmShare';
import NotFound from './pages/NotFound/NotFound';

const Layout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const showNavbar = !currentPath.startsWith('/signin') && !currentPath.startsWith('/confirm');

  return (
    <>
      {showNavbar && <Navbar currentPath={currentPath} />}
      <main>
        <Outlet />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#E8E8E8',
            border: '1px solid #1E1E1E',
            borderRadius: '4px',
            fontFamily: '"IBM Plex Mono", monospace'
          },
          success: {
            iconTheme: {
              primary: '#C8F135',
              secondary: '#0A0A0A',
            },
          },
        }}
      />
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/signin', element: <SignIn /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/splits/new', element: <CreateSplit /> },
      { path: '/splits/:id', element: <SplitDetail /> },
      { path: '/confirm/:token', element: <ConfirmShare /> },
      { path: '*', element: <NotFound /> }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
