import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, FileText, User, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Services', path: '/services', icon: Wrench },
    { name: 'Request Info', path: '/request-info', icon: FileText },
    { name: 'Client Portal', path: '/portal', icon: User },
    { name: 'Tech Dashboard', path: '/tech', icon: LayoutDashboard },
  ];

  return (
    <div className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="/logo.png"
            alt="6th Sense Personal Logo" 
            style={{ height: '40px', width: 'auto' }} 
          />
        </Link>
        <div className="nav-links">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
