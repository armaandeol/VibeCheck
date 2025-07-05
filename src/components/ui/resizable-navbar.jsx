import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export const Navbar = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={false}
      animate={{
        width: isScrolled ? '90%' : '100%',
        x: isScrolled ? '5%' : '0%',
      }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md border-b border-white/10
        ${isScrolled ? 'bg-black/80 rounded-b-xl' : 'bg-transparent'}`}
    >
      {children}
    </motion.nav>
  );
};

export const NavBody = ({ children }) => {
  return (
    <div className="container mx-auto px-4 h-full hidden md:flex items-center justify-between">
      {children}
    </div>
  );
};

export const NavItems = ({ items }) => {
  return (
    <div className="flex items-center space-x-8">
      {items.map((item, idx) => (
        <a
          key={`nav-item-${idx}`}
          href={item.link}
          className="text-gray-300 hover:text-[#1DB954] transition-colors duration-300 text-sm font-medium"
        >
          {item.name}
        </a>
      ))}
    </div>
  );
};

export const NavbarLogo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.481.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </div>
      <span className="text-xl font-bold text-white">VibeCheck</span>
    </div>
  );
};

export const NavbarButton = ({ children, variant = 'primary', className = '', onClick }) => {
  const baseClasses = 'px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm';
  const variants = {
    primary: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
    secondary: 'border border-white/20 hover:border-[#1DB954] text-white hover:text-[#1DB954]'
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const MobileNav = ({ children }) => {
  return (
    <div className="md:hidden">
      {children}
    </div>
  );
};

export const MobileNavHeader = ({ children }) => {
  return (
    <div className="flex items-center justify-between px-4 h-16">
      {children}
    </div>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-white p-2 focus:outline-none"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
};

export const MobileNavMenu = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-lg border-t border-white/10"
        >
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};