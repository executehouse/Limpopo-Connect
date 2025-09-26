import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import BusinessDirectory from './pages/BusinessDirectory';
import Events from './pages/Events';
import Marketplace from './pages/Marketplace';
import Tourism from './pages/Tourism';
import News from './pages/News';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="business-directory" element={<BusinessDirectory />} />
            <Route path="events" element={<Events />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="tourism" element={<Tourism />} />
            <Route path="news" element={<News />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
