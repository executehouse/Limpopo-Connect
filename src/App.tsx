import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthProvider';
import Layout from './components/layout/Layout';
import RequireRole from './components/RequireRole';

// Pages
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
import DiagnosticPage from './pages/DiagnosticPage';
import Health from './pages/Health';

// Role-based pages
import CompleteOnboarding from './pages/CompleteOnboarding';
import VisitorDashboard from './pages/VisitorDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminDashboard from './pages/AdminDashboard';

import './index.css';

// Get the base path from Vite's base configuration
const basename = import.meta.env.BASE_URL;

function App() {
  return (
    <AuthProvider>
      <Router basename={basename}>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Auth routes - accessible to all */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Legacy auth routes for backwards compatibility */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Diagnostic route for debugging deployment issues */}
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            
            {/* Health check route for deployment verification */}
            <Route path="/health" element={<Health />} />

            {/* Onboarding - protected route */}
            <Route 
              path="/complete-onboarding" 
              element={
                <RequireRole roles={['citizen', 'business', 'admin']}>
                  <CompleteOnboarding />
                </RequireRole>
              } 
            />

            {/* Standardized dashboard routes */}
            <Route 
              path="/dashboard/visitor" 
              element={<VisitorDashboard />}
            />
            
            <Route 
              path="/dashboard/citizen" 
              element={
                <RequireRole roles={['citizen', 'business', 'admin']}>
                  <CitizenDashboard />
                </RequireRole>
              } 
            />
            
            <Route 
              path="/dashboard/business" 
              element={
                <RequireRole roles={['business', 'admin']}>
                  <BusinessDashboard />
                </RequireRole>
              } 
            />
            
            <Route 
              path="/dashboard/admin" 
              element={
                <RequireRole roles={['admin']}>
                  <AdminDashboard />
                </RequireRole>
              } 
            />

            {/* Legacy role-specific dashboards (for backwards compatibility) */}
            <Route 
              path="/home" 
              element={
                <RequireRole roles={['citizen', 'business', 'admin']}>
                  <CitizenDashboard />
                </RequireRole>
              } 
            />
            
            <Route 
              path="/business-dashboard" 
              element={
                <RequireRole roles={['business', 'admin']}>
                  <BusinessDashboard />
                </RequireRole>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <RequireRole roles={['admin']}>
                  <AdminDashboard />
                </RequireRole>
              } 
            />

            {/* Main layout with nested routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              
              {/* Explore route for visitors */}
              <Route path="explore" element={<Home />} />
              
              {/* Public routes - accessible to all roles */}
              <Route path="business-directory" element={<BusinessDirectory />} />
              <Route path="events" element={<Events />} />
              <Route path="tourism" element={<Tourism />} />
              <Route path="news" element={<News />} />
              
              {/* Protected routes - require authentication */}
              <Route 
                path="marketplace" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <Marketplace />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="connections" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <Connections />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="connections/friendship-partners" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <FriendshipPartners />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="connections/meaningful-relationships" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <MeaningfulRelationships />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="connections/casual-meetups" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <CasualMeetups />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="connections/shared-interests" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <SharedInterests />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="connections/community-stories" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <CommunityStories />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="connections/missed-moments" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <MissedMoments />
                  </RequireRole>
                } 
              />
              
              {/* Profile routes - require authentication */}
              <Route 
                path="profile" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <Profile />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="profile/me" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <Profile />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="profile/me/edit" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <Profile />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="profile/:userId" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <Profile />
                  </RequireRole>
                } 
              />
              
              <Route 
                path="chat-demo" 
                element={
                  <RequireRole roles={['citizen', 'business', 'admin']}>
                    <ChatDemo />
                  </RequireRole>
                } 
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
