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
      path: '/test',
    },
    {
      pageComponentElement: <LoginPage />,
      path: '/login',
    },
  ]

  const adminPages = [
    {
      pageComponentElement: <AdminPage />,
      path: '/admin',
    },
    {
      pageComponentElement: <AdminUsersPage />,
      path: '/admin/users',
    },
    {
      pageComponentElement: <AdminLeaguesPage />,
      path: '/admin/leagues',
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
  );
}

const Root = styled.div`
  overflow-x: hidden;
  max-width: 100vw;
`;

export default App;