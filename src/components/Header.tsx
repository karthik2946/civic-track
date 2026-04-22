import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();
  const showBack = location.pathname !== '/';
  
  // Show different nav links based on auth state and role
  const getNavLinks = () => {
    if (!user) {
      return [{ href: '/', label: 'Home' }];
    }
    
    if (role === 'authority') {
      return [
        { href: '/authority', label: 'Dashboard' },
      ];
    }
    
    return [
      { href: '/citizen', label: 'Report Issue' },
      { href: '/track', label: 'Track Issues' },
    ];
  };
  
  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to={user ? (role === 'authority' ? '/authority' : '/citizen') : '/'} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground hidden sm:block">
              CivicTrack
            </span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                size="sm"
                className={isActive(link.href) ? "bg-secondary text-secondary-foreground" : ""}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center gap-2">
          {!isLoading && !user && (
            <Link to="/auth">
              <Button variant="default" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
          {user && role && (
            <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
              {role === 'authority' ? '👔 Authority' : '👤 Citizen'}
            </span>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card"
          >
            <nav className="container px-4 py-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(link.href) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full mt-2">Login / Sign Up</Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
