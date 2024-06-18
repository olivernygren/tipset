import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import TestPage from './pages/test';
import LoginPage from './pages/login';
import { auth } from './config/firebase';
import Header from './components/header/Header';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import AdminPage from './pages/admin';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminUsersPage from './pages/admin/users';
import AdminLeaguesPage from './pages/admin/leagues';
import PredictionLeaguesPage from './pages/leagues';
import { RoutesEnum } from './utils/Routes';
import { AnimatePresence } from 'framer-motion';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const pages = [
    {
      pageComponentElement: <HomePage />,
      path: '/',
    },
    {
      pageComponentElement: <TestPage />,
      path: `/${RoutesEnum.TEST}`,
    },
    {
      pageComponentElement: <LoginPage />,
      path: `/${RoutesEnum.LOGIN}`,
    },
    {
      pageComponentElement: <PredictionLeaguesPage />,
      path: `/${RoutesEnum.LEAGUES}`,
    },
  ]

  const adminPages = [
    {
      pageComponentElement: <AdminPage />,
      path: `/${RoutesEnum.ADMIN}`,
    },
    {
      pageComponentElement: <AdminUsersPage />,
      path: `/${RoutesEnum.ADMIN_USERS}`,
    },
    {
      pageComponentElement: <AdminLeaguesPage />,
      path: `/${RoutesEnum.ADMIN_LEAGUES}`,
    }
  ];

  const getPage = (pageComponentElement: JSX.Element, path: string) => {
    return (
      <Route path={path} element={pageComponentElement} />
    );
  }

  const getAdminPage = (pageComponentElement: JSX.Element, path: string) => {
    return (
      <Route path={path} element={
        <PrivateRoute isLoading={isLoading} isAuthenticated={user !== null} isAdmin={true}>
          <AdminLayout>
            {pageComponentElement}
          </AdminLayout>
        </PrivateRoute>
      } />
    );
  }

  return (
    <AnimatePresence>
      <Root>
        <Header user={user} />
        <Router>
          <div className="App">
            <Routes>
              {pages.map(({ pageComponentElement, path }) => getPage(pageComponentElement, path))}
              {adminPages.map(({ pageComponentElement, path }) => getAdminPage(pageComponentElement, path))}
            </Routes>
          </div>
        </Router>
      </Root>
    </AnimatePresence>
  );
}

const Root = styled.div`
  overflow-x: hidden;
  max-width: 100vw;
`;

export default App;