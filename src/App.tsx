import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import TestPage from './pages/test';
import LoginPage from './pages/login';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Define your routes here */}
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/leagues/:leagueId" element={<></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;