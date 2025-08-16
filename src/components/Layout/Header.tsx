import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, Wallet, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    disconnectWallet();
    navigate('/');
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      alert('Failed to connect wallet. Please make sure Phantom is installed.');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">JobPortal</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/jobs"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Jobs
              </Link>
              <Link
                to="/feed"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Feed
              </Link>
              <Link
                to="/post-job"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Post Job</span>
              </Link>
              
              {/* Wallet Connection */}
              <div className="flex items-center space-x-2">
                {wallet.connected ? (
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-md">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      {wallet.balance.toFixed(4)} SOL
                    </span>
                    <button
                      onClick={disconnectWallet}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleWalletConnect}
                    className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-sm hover:bg-purple-100 transition-colors"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>

              <Link
                to="/profile"
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user.name}</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};