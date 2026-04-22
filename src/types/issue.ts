 export type IssueCategory = 
   | 'garbage'
   | 'pothole'
   | 'water_leakage'
   | 'streetlight'
   | 'drainage'
   | 'other';
 
 export type IssueStatus = 'reported' | 'in_progress' | 'resolved';
 
 export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
 
 export interface Issue {
   id: string;
   title: string;
   description: string;
   category: IssueCategory;
   status: IssueStatus;
   priority: IssuePriority;
   location: {
     address: string;
     lat: number;
     lng: number;
   };
   imageUrl?: string;
   reportedBy: string;
   reportedAt: Date;
   assignedTo?: string;
   resolvedAt?: Date;
   upvotes: number;
 }
 
 export const CATEGORY_LABELS: Record<IssueCategory, string> = {
   garbage: 'Garbage Collection',
   pothole: 'Road / Pothole',
   water_leakage: 'Water Leakage',
   streetlight: 'Streetlight',
   drainage: 'Drainage / Sanitation',
   other: 'Other',
 };
 
 export const CATEGORY_ICONS: Record<IssueCategory, string> = {
   garbage: '🗑️',
   pothole: '🚗',
   water_leakage: '💧',
   streetlight: '💡',
   drainage: '🚿',
   other: '📋',
 };
 
 export const STATUS_LABELS: Record<IssueStatus, string> = {
   reported: 'Reported',
   in_progress: 'In Progress',
   resolved: 'Resolved',
 };
 
 export const PRIORITY_LABELS: Record<IssuePriority, string> = {
   low: 'Low',
   medium: 'Medium',
   high: 'High',
   urgent: 'Urgent',
 };