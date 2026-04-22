import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-xl">🏛️</span>
              </div>
              <span className="font-display font-bold text-xl">CivicTrack</span>
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-md">
              A crowdsourced platform connecting citizens with municipal authorities 
              for transparent and efficient civic issue resolution.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/citizen" className="hover:text-primary-foreground transition-colors">Report Issue</Link></li>
              <li><Link to="/track" className="hover:text-primary-foreground transition-colors">Track Status</Link></li>
              <li><Link to="/authority" className="hover:text-primary-foreground transition-colors">Authority Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Guidelines</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
          <p>© 2025 CivicTrack. Built for Design Thinking SIH25031.</p>
        </div>
      </div>
    </footer>
  );
}
