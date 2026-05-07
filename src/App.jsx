import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Services from './pages/Services';
import QuoteRequest from './pages/QuoteRequest';
import IntakeForm from './pages/IntakeForm';
import SuccessPage from './pages/SuccessPage';
import ClientDashboard from './pages/ClientDashboard';
import TechDashboard from './pages/TechDashboard';
import TechLogin from './pages/TechLogin';
import ResetPassword from './pages/ResetPassword';
import Policies from './pages/Policies';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/request-info" element={<Layout><QuoteRequest /></Layout>} />
      <Route path="/policies" element={<Layout><Policies /></Layout>} />
      <Route path="/intake" element={<Layout><IntakeForm /></Layout>} />
      <Route path="/success" element={<Layout><SuccessPage /></Layout>} />
      <Route path="/portal/*" element={<Layout><ClientDashboard /></Layout>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Protected Technician Routes */}
      <Route path="/login" element={<TechLogin />} />
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route path="/tech/*" element={<TechDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
