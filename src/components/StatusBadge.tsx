 import { IssueStatus, STATUS_LABELS } from '@/types/issue';
 import { Circle, Clock, CheckCircle2 } from 'lucide-react';
 
 interface StatusBadgeProps {
   status: IssueStatus;
   size?: 'sm' | 'md';
 }
 
 const statusConfig = {
   reported: {
     icon: Circle,
     className: 'status-badge status-reported',
   },
   in_progress: {
     icon: Clock,
     className: 'status-badge status-in-progress',
   },
   resolved: {
     icon: CheckCircle2,
     className: 'status-badge status-resolved',
   },
 };
 
 export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
   const config = statusConfig[status];
   const Icon = config.icon;
   
   return (
     <span className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}>
       <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
       {STATUS_LABELS[status]}
     </span>
   );
 }
