import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { StyleSheetManager } from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import isPropValid from '@emotion/is-prop-valid';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import Header from './components/header/Header';
import AdminPage from './pages/admin';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminUsersPage from './pages/admin/users';
import AdminLeaguesPage from './pages/admin/leagues';
import PredictionLeaguesPage from './pages/leagues';
import { RoutesEnum } from './utils/Routes';
import PredictionLeaguePage from './pages/leagues/[leagueId]';
import RulesPage from './pages/rules';
import HowToPlayPage from './pages/how-to-play';
import ProfilePage from './pages/profile';
import PlayerRatingsPage from './pages/admin/player-ratings';
import AdminPlayersPage from './pages/admin/players';
import PlayersByTeamPage from './pages/admin/players/[teamId]';
import { theme } from './theme';
import { useUser } from './context/UserContext';
import AdminFixturesPage from './pages/admin/fixtures';

const App = () => {
  const { user, hasAdminRights } = useUser();
  // const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  const pages = [
    {
      pageComponentElement: <HomePage />,
      path: '/',
    },
    {
      pageComponentElement: <LoginPage />,
      path: `/${RoutesEnum.LOGIN}`,
    },
    {
      pageComponentElement: <PredictionLeaguesPage />,
      path: `/${RoutesEnum.LEAGUES}`,
    },
    {
      pageComponentElement: <PredictionLeaguePage />,
      path: `/${RoutesEnum.LEAGUE}`,
    },
    {
      pageComponentElement: <RulesPage />,
      path: `/${RoutesEnum.RULES}`,
    },
    {
      pageComponentElement: <HowToPlayPage />,
      path: `/${RoutesEnum.HOW_TO_PLAY}`,
    },
    {
      pageComponentElement: <ProfilePage />,
      path: `/${RoutesEnum.PROFILE}`,
    },
  ];

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
    },
    {
      pageComponentElement: <PlayerRatingsPage />,
      path: `/${RoutesEnum.ADMIN_PLAYER_RATINGS}`,
    },
    {
      pageComponentElement: <AdminPlayersPage />,
      path: `/${RoutesEnum.ADMIN_PLAYERS}`,
    },
    {
      pageComponentElement: <PlayersByTeamPage />,
      path: `/${RoutesEnum.ADMIN_PLAYERS_TEAM}`,
    },
    {
      pageComponentElement: <AdminFixturesPage />,
      path: `/${RoutesEnum.ADMIN_FIXTURES}`,
    },
  ];

  const getPage = (pageComponentElement: JSX.Element, path: string) => (
    <Route path={path} element={pageComponentElement} />
  );

  const getAdminPage = (pageComponentElement: JSX.Element, path: string) => (
    <Route
      path={path}
      element={(
        <PrivateRoute isLoading={isLoading} isAuthenticated={user !== null && !isLoading} isAdmin={hasAdminRights}>
          <AdminLayout>
            {pageComponentElement}
          </AdminLayout>
        </PrivateRoute>
      )}
    />
  );

  return (
    <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
      <AnimatePresence>
        <Root>
          <Header />
          <Router>
            <Content className="App">
              <Routes>
                {pages.map(({ pageComponentElement, path }) => getPage(pageComponentElement, path))}
                {adminPages.map(({ pageComponentElement, path }) => getAdminPage(pageComponentElement, path))}
              </Routes>
            </Content>
          </Router>
        </Root>
      </AnimatePresence>
    </StyleSheetManager>
  );
};

const Root = styled.div`
  overflow-x: hidden;
  max-width: 100vw;
  background-color: ${theme.colors.silverLighter};
`;

const Content = styled.div`
  padding-top: 80px;
`;

export default App;
