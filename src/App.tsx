import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Define your routes here */}
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;