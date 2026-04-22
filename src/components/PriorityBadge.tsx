 import { IssuePriority, PRIORITY_LABELS } from '@/types/issue';
 import { AlertTriangle, ArrowUp, ArrowUpRight, Minus } from 'lucide-react';
 
 interface PriorityBadgeProps {
   priority: IssuePriority;
 }
 
 const priorityConfig = {
   low: {
     icon: Minus,
     className: 'bg-slate-100 text-slate-600',
   },
   medium: {
     icon: ArrowUpRight,
     className: 'bg-blue-100 text-blue-700',
   },
   high: {
     icon: ArrowUp,
     className: 'bg-orange-100 text-orange-700',
   },
   urgent: {
     icon: AlertTriangle,
     className: 'bg-red-100 text-red-700',
   },
 };
 
 export function PriorityBadge({ priority }: PriorityBadgeProps) {
   const config = priorityConfig[priority];
   const Icon = config.icon;
   
   return (
     <span className={`status-badge ${config.className}`}>
       <Icon className="w-3.5 h-3.5" />
       {PRIORITY_LABELS[priority]}
     </span>
   );
 }
