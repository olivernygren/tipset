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

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // initialize loading state as true

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false); // set loading state to false when user data has been fetched
    });
  }, []);

  return (
    <Root>
      <Header user={user} />
      <Router>
        <div className="App">
          <Routes>
            {/* Define your routes here */}
            <Route path="/" element={<HomePage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={
              <PrivateRoute isLoading={isLoading} isAuthenticated={user !== null} isAdmin={true}>
                <AdminPage />
              </PrivateRoute>
            } />
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