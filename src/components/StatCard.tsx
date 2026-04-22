 import { motion } from 'framer-motion';
 import { LucideIcon } from 'lucide-react';
 
 interface StatCardProps {
   icon: LucideIcon;
   label: string;
   value: string | number;
   change?: string;
   changeType?: 'positive' | 'negative' | 'neutral';
   delay?: number;
 }
 
 export function StatCard({ icon: Icon, label, value, change, changeType = 'neutral', delay = 0 }: StatCardProps) {
   const changeColors = {
     positive: 'text-emerald-600',
     negative: 'text-red-600',
     neutral: 'text-muted-foreground',
   };
   
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay }}
       className="stat-card"
     >
       <div className="flex items-start justify-between">
         <div>
           <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
           <p className="text-3xl font-display font-bold text-foreground">{value}</p>
           {change && (
             <p className={`text-sm mt-1 ${changeColors[changeType]}`}>
               {change}
             </p>
           )}
         </div>
         <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
           <Icon className="w-6 h-6 text-primary" />
         </div>
       </div>
     </motion.div>
   );
 }
