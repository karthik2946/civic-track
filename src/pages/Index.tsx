import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 overflow-hidden">
      <Header />
      
      <main className="flex-1 relative">
        {/* Decor Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-[80px] animate-float pointer-events-none" />
        <div className="absolute top-40 left-[15%] w-48 h-48 bg-accent/10 rounded-full blur-[60px] animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />

        {/* Hero Section */}
        <section className="container px-4 pt-24 pb-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-white/5 border border-border shadow-sm text-primary text-sm font-bold mb-10"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
              CIVICTRACK PLATFORM
            </motion.div>
            
            <h1 className="text-5xl md:text-8xl font-display font-black text-foreground mb-8 leading-[1.1] tracking-tighter">
              Report. Track. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Resolve.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground/80 max-w-3xl mx-auto mb-12 leading-relaxed">
              Empowering communities with a transparent, high-efficiency platform 
              connecting citizens with local authorities for rapid civic issue resolution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="btn-hero h-16 px-12 text-lg">
                  Launch Platform
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="ghost" className="h-16 px-10 text-lg font-bold hover:bg-secondary/50 border border-transparent hover:border-border transition-all">
                  Authority Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
        
        <section className="container px-4 py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="section-title">
              Designed for Impact
            </h2>
            <p className="section-subtitle mx-auto">
              Our streamlined workflow ensures every reported issue is seen, tracked, and resolved with total transparency.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: FileText,
                title: 'Instant Reporting',
                description: 'Capture and submit civic issues in seconds with geolocation and photo uploads.',
                color: 'bg-primary'
              },
              {
                icon: TrendingUp,
                title: 'Real-time Tracking',
                description: 'Watch your community improve with live status updates and notification alerts.',
                color: 'bg-accent'
              },
              {
                icon: Users,
                title: 'Direct Action',
                description: 'Verified authorities engage directly with your reports for maximum accountability.',
                color: 'bg-primary'
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="stat-card group hover:-translate-y-2 transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 text-primary`} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="container px-4 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-hero rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -ml-48 -mb-48" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8 tracking-tighter">
                Ready to transform <br />your community?
              </h2>
              <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12 font-medium">
                Join thousands of citizens already making a difference. CivicTrack is free, fast, and remarkably effective.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="btn-hero bg-white text-primary border-none text-xl h-18 px-12 rounded-2xl shadow-xl hover:shadow-2xl">
                  Get Started Now
                  <ArrowRight className="ml-3 w-7 h-7" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
