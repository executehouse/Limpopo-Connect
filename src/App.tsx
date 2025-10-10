import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthProvider';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import BusinessDirectory from './pages/BusinessDirectory';
import Events from './pages/Events';
import Marketplace from './pages/Marketplace';
import Tourism from './pages/Tourism';
import News from './pages/News';
import Connections from './pages/Connections';
import FriendshipPartners from './pages/connections/FriendshipPartners';
import MeaningfulRelationships from './pages/connections/MeaningfulRelationships';
import CasualMeetups from './pages/connections/CasualMeetups';
import SharedInterests from './pages/connections/SharedInterests';
import CommunityStories from './pages/connections/CommunityStories';
import MissedMoments from './pages/connections/MissedMoments';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import ChatDemo from './pages/ChatDemo';
import './index.css';

// Get the base path from Vite's base configuration
const basename = import.meta.env.BASE_URL;

function App() {
  return (
    <AuthProvider>
      <Router basename={basename}>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="business-directory" element={<BusinessDirectory />} />
              <Route path="events" element={<Events />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="tourism" element={<Tourism />} />
              <Route path="news" element={<News />} />
              <Route path="connections" element={<Connections />} />
              <Route path="connections/friendship-partners" element={<FriendshipPartners />} />
              <Route path="connections/meaningful-relationships" element={<MeaningfulRelationships />} />
              <Route path="connections/casual-meetups" element={<CasualMeetups />} />
            <Route path="connections/shared-interests" element={<SharedInterests />} />
            <Route path="connections/community-stories" element={<CommunityStories />} />
            <Route path="connections/missed-moments" element={<MissedMoments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chat-demo" element={<ChatDemo />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
