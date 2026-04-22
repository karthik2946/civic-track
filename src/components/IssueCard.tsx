 import { Issue, CATEGORY_ICONS, CATEGORY_LABELS } from '@/types/issue';
 import { StatusBadge } from './StatusBadge';
 import { PriorityBadge } from './PriorityBadge';
 import { MapPin, ThumbsUp, Clock, User } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { motion } from 'framer-motion';
 
 interface IssueCardProps {
   issue: Issue;
   onClick?: () => void;
   showActions?: boolean;
 }
 
 export function IssueCard({ issue, onClick, showActions = false }: IssueCardProps) {
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       whileHover={{ y: -4 }}
       transition={{ duration: 0.2 }}
       className="card-issue p-5 cursor-pointer"
       onClick={onClick}
     >
       <div className="flex gap-4">
         {issue.imageUrl && (
           <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
             <img 
               src={issue.imageUrl} 
               alt={issue.title}
               className="w-full h-full object-cover"
             />
           </div>
         )}
         
         <div className="flex-1 min-w-0">
           <div className="flex items-start justify-between gap-3 mb-2">
             <div className="flex items-center gap-2">
               <span className="text-xl">{CATEGORY_ICONS[issue.category]}</span>
               <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                 {CATEGORY_LABELS[issue.category]}
               </span>
             </div>
             <StatusBadge status={issue.status} size="sm" />
           </div>
           
           <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
             {issue.title}
           </h3>
           
           <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
             {issue.description}
           </p>
           
           <div className="flex items-center gap-4 text-xs text-muted-foreground">
             <span className="flex items-center gap-1">
               <MapPin className="w-3.5 h-3.5" />
               <span className="line-clamp-1">{issue.location.address}</span>
             </span>
           </div>
           
           <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
             <div className="flex items-center gap-4 text-xs text-muted-foreground">
               <span className="flex items-center gap-1">
                 <Clock className="w-3.5 h-3.5" />
                 {formatDistanceToNow(issue.reportedAt, { addSuffix: true })}
               </span>
               <span className="flex items-center gap-1">
                 <User className="w-3.5 h-3.5" />
                 {issue.reportedBy}
               </span>
             </div>
             
             <div className="flex items-center gap-1.5 text-primary font-medium">
               <ThumbsUp className="w-4 h-4" />
               <span>{issue.upvotes}</span>
             </div>
           </div>
           
           {showActions && (
             <div className="flex items-center gap-2 mt-3">
               <PriorityBadge priority={issue.priority} />
               {issue.assignedTo && (
                 <span className="text-xs text-muted-foreground">
                   → {issue.assignedTo}
                 </span>
               )}
             </div>
           )}
         </div>
       </div>
     </motion.div>
   );
 }
