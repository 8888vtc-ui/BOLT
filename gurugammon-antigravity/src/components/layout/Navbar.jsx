import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Home, Trophy, User, LogOut, Dice5 } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Dice5 className="w-8 h-8 text-primary-400 group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-bold text-gradient">
              Gurugammon
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/lobby"
                  className="flex items-center space-x-1 text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Lobby</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-300 hover:text-primary-400 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{user.username}</span>
                </Link>

                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
