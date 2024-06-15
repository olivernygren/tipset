import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import TestPage from './pages/test';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Define your routes here */}
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;