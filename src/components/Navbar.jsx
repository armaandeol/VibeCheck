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
              <NavbarButton
                variant="secondary"
                onClick={() => setShowAddFriends(true)}
              >
                Add Friends
              </NavbarButton>
              <NavbarButton
                variant="primary"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </NavbarButton>
            </>
          ) : (
            <Link to="/login">
              <NavbarButton variant="primary">Sign In</NavbarButton>
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
              <NavbarButton
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setShowAddFriends(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                Add Friends
              </NavbarButton>
              <NavbarButton
                variant="primary"
                className="w-full"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </NavbarButton>
            </div>
          ) : (
            <Link to="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
              <NavbarButton variant="primary" className="w-full">
                Sign In
              </NavbarButton>
            </Link>
          )}
        </MobileNavMenu>
      </MobileNav>

      {/* Add Friends Modal */}
      {showAddFriends && (
        <AddFriends onClose={() => setShowAddFriends(false)} />
      )}
    </ResizableNavbar>
  );
};

export default Navbar;
