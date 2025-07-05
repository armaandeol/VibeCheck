import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import AddFriends from './AddFriends';
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from './ui/resizable-navbar';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      setShowNotifications(false);
      setShowAddFriends(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const navItems = user ? [
    {
      name: "Home",
      link: "/"
    },
    {
      name: "Profile",
      link: "/profile"
    }
  ] : [
    {
      name: "Dashboard",
      link: "/"
    }
  ];

  return (
    <ResizableNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notification Button */}
              <button
                className="spotify-button-secondary flex items-center gap-2"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.086 2.086a1 1 0 0 1-1.414 1.414L15 15.5H4.5a1 1 0 0 1-1.414-1.414L5.5 14.25V9.75a6 6 0 0 1 6-6z" />
                </svg>
                Notifications
              </button>
              <button
                className="spotify-button-secondary"
                onClick={() => setShowAddFriends(true)}
              >
                Add Friends
              </button>
              <button
                className="spotify-button"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="spotify-button">Sign In</button>
            </Link>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              to={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-[#1DB954] transition-colors duration-300"
            >
              {item.name}
            </Link>
          ))}
          {user ? (
            <div className="flex flex-col gap-4">
              <button
                className="spotify-button-secondary w-full flex items-center justify-center gap-2"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.086 2.086a1 1 0 0 1-1.414 1.414L15 15.5H4.5a1 1 0 0 1-1.414-1.414L5.5 14.25V9.75a6 6 0 0 1 6-6z" />
                </svg>
                Notifications
              </button>
              <button
                className="spotify-button-secondary w-full"
                onClick={() => {
                  setShowAddFriends(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                Add Friends
              </button>
              <button
                className="spotify-button w-full"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          ) : (
            <Link to="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="spotify-button w-full">
                Sign In
              </button>
            </Link>
          )}
        </MobileNavMenu>
      </MobileNav>

      {/* Add Friends Modal */}
      {showAddFriends && (
        <AddFriends isOpen={showAddFriends} onClose={() => setShowAddFriends(false)} />
      )}
    </ResizableNavbar>
  );
};

export default Navbar;
