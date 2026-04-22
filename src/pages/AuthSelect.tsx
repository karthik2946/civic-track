import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const AuthSelect = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && role) {
    navigate(role === 'authority' ? '/authority' : '/citizen', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              CivicTrack
            </span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            How would you like to sign in?
          </h1>
          <p className="text-muted-foreground mb-10">
            Choose your role to continue to the appropriate login page.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/auth/citizen">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Citizen
                </h3>
                <p className="text-sm text-muted-foreground">
                  Report civic issues and track their resolution status.
                </p>
              </motion.div>
            </Link>

            <Link to="/auth/authority">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  Authority
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage and resolve reported civic issues in your area.
                </p>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl">🏛️</span>
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Make Your City Better
          </h2>
          <p className="text-primary-foreground/80 max-w-md">
            Report civic issues, track resolutions, and contribute to
            building a transparent and accountable governance system.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthSelect;
