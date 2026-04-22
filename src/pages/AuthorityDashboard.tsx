import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { useIssuesContext } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABELS, STATUS_LABELS, IssueCategory, IssueStatus, CATEGORY_ICONS } from '@/types/issue';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Clock, CheckCircle, AlertTriangle, Search, 
  MapPin, Calendar, X, UserPlus, Loader2, LogOut, Send, Navigation
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Issue {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  reporter_name?: string;
  distance?: number;
}

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const AuthorityDashboard = () => {
  const { issues, updateIssueStatus, isLoading } = useIssuesContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [resolvedMessage, setResolvedMessage] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [showNearbyReports, setShowNearbyReports] = useState(false);
  const [authorityLocation, setAuthorityLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter nearby issues (10km radius)
  const nearbyIssues = authorityLocation
    ? (filteredIssues as Issue[])
        .filter(issue => issue.lat && issue.lng)
        .map((issue: Issue) => ({
          ...issue,
          distance: calculateDistance(
            authorityLocation.lat,
            authorityLocation.lng,
            issue.lat!,
            issue.lng!
          ),
        }))
        .filter(issue => (issue.distance || 0) <= 10)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0)) as Issue[]
    : [];

  const displayIssues = (showNearbyReports && authorityLocation ? nearbyIssues : filteredIssues) as Issue[];

  const totalIssues = displayIssues.length;
  const pendingCount = displayIssues.filter(i => i.status === 'reported').length;
  const inProgressCount = displayIssues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = displayIssues.filter(i => i.status === 'resolved').length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;

  const stats = [
    { 
      icon: FileText, 
      label: 'Total Issues', 
      value: totalIssues,
      change: totalIssues > 0 ? `${totalIssues} total` : 'No issues yet',
      changeType: 'neutral' as const
    },
    { 
      icon: AlertTriangle, 
      label: 'Pending', 
      value: pendingCount,
      change: pendingCount > 0 ? 'Needs attention' : 'All clear',
      changeType: pendingCount > 0 ? 'negative' as const : 'positive' as const
    },
    { 
      icon: Clock, 
      label: 'In Progress', 
      value: inProgressCount,
      change: inProgressCount > 0 ? 'Being worked on' : 'None active',
      changeType: 'neutral' as const
    },
    { 
      icon: CheckCircle, 
      label: 'Resolved', 
      value: resolvedCount,
      change: totalIssues > 0 ? `${resolutionRate}% resolution rate` : 'No data',
      changeType: 'positive' as const
    },
  ];

  // Handle fetching nearby reports
  const handleFetchNearbyReports = async () => {
    setFetchingLocation(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };
            
            // Calculate nearby issues with the new location
            const nearby = (filteredIssues as Issue[])
              .filter(issue => issue.lat && issue.lng)
              .map((issue: Issue) => ({
                ...issue,
                distance: calculateDistance(
                  newLocation.lat,
                  newLocation.lng,
                  issue.lat!,
                  issue.lng!
                ),
              }))
              .filter(issue => (issue.distance || 0) <= 10)
              .sort((a, b) => (a.distance || 0) - (b.distance || 0)) as Issue[];
            
            setAuthorityLocation(newLocation);
            setShowNearbyReports(true);
            toast.success(`Found ${nearby.length} issues within 10km of your location`);
            setFetchingLocation(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Unable to access your location. Please enable location permissions.');
            setFetchingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        toast.error('Geolocation is not supported by your browser');
        setFetchingLocation(false);
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      toast.error('Failed to fetch nearby reports');
      setFetchingLocation(false);
    }
  };

  const handleResetToAllReports = () => {
    setShowNearbyReports(false);
    setAuthorityLocation(null);
    toast.info('Showing all reports');
  };

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    if (newStatus === 'resolved') {
      // Show resolution form for resolved status
      setShowResolutionForm(true);
      return;
    }
    
    // For other status changes, update directly
    await updateIssueStatus(issueId, newStatus);
    toast.success(`Issue status updated to "${STATUS_LABELS[newStatus]}"`);
    setSelectedIssue(null);
  };

  const handleResolveIssue = async () => {
    if (!selectedIssue) return;

    try {
      await updateIssueStatus(
        selectedIssue.id,
        'resolved',
        undefined,
        resolutionDetails,
        resolvedMessage
      );
      toast.success('Issue resolved and email notification sent to citizen!');
      
      // Reset form
      setResolutionDetails('');
      setResolvedMessage('');
      setShowResolutionForm(false);
      setSelectedIssue(null);
    } catch (error) {
      console.error('Error resolving issue:', error);
      toast.error('Failed to resolve issue');
    }
  };

  const handleAssign = async (issueId: string) => {
    await updateIssueStatus(issueId, 'in_progress', 'Field Worker Team A');
    toast.success('Issue assigned to field worker');
    setSelectedIssue(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* User Info Bar */}
          <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-xl border border-border">
            <div>
              <p className="text-sm text-muted-foreground">Authority Account</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Authority Dashboard
            </h1>
            <p className="text-muted-foreground">
              {showNearbyReports 
                ? `Showing civic issues within 10km of your location (${displayIssues.length} total)`
                : "Manage and resolve civic issues reported by citizens"
              }
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
          
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by title or location..."
                  className="pl-10 input-civic"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 input-civic">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map(cat => (
                    <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 input-civic">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {(Object.keys(STATUS_LABELS) as IssueStatus[]).map(status => (
                    <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nearby Reports Button */}
            <div className="flex gap-2 flex-wrap">
              {!showNearbyReports ? (
                <Button 
                  className="gap-2"
                  onClick={handleFetchNearbyReports}
                  disabled={fetchingLocation}
                >
                  <Navigation className="w-4 h-4" />
                  {fetchingLocation ? 'Fetching Location...' : 'Fetch Nearby Reports (10km)'}
                </Button>
              ) : (
                <div className="flex gap-2 items-center bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Showing {displayIssues.length} nearby reports within 10km
                  </span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToAllReports}
                    className="h-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Issues Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Issue</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground hidden md:table-cell">Location</th>
                      {showNearbyReports && (
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Distance</th>
                      )}
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground hidden lg:table-cell">Priority</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground hidden lg:table-cell">Reported</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground hidden md:table-cell">Reported By</th>
                      <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayIssues.map((issue, i) => (
                      <motion.tr
                        key={issue.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{CATEGORY_ICONS[issue.category as IssueCategory]}</span>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{issue.title}</p>
                              <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[issue.category as IssueCategory]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{issue.address || 'Not specified'}</span>
                          </span>
                        </td>
                        {showNearbyReports && (
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              issue.distance && issue.distance <= 5 ? 'bg-green-100 text-green-700' :
                              issue.distance && issue.distance <= 10 ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              <Navigation className="w-3 h-3" />
                              {issue.distance?.toFixed(1)} km
                            </span>
                          </td>
                        )}
                        <td className="p-4">
                          <StatusBadge status={issue.status as IssueStatus} size="sm" />
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <PriorityBadge priority={issue.priority as any} />
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-foreground font-medium">
                            {issue.reporter_name || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssue(issue);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {!isLoading && displayIssues.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  {showNearbyReports 
                    ? "No issues found within 10km of your location."
                    : issues.length === 0 
                    ? "No issues have been reported yet. Citizens will see their reports here once submitted."
                    : "No issues match your criteria"
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
      
      {/* Issue Detail Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{CATEGORY_ICONS[selectedIssue.category as IssueCategory]}</span>
                    <span className="text-sm font-medium text-muted-foreground uppercase">
                      {CATEGORY_LABELS[selectedIssue.category as IssueCategory]}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold">{selectedIssue.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedIssue.image_url && (
                  <div className="relative bg-muted rounded-xl overflow-hidden">
                    <img 
                      src={selectedIssue.image_url} 
                      alt={selectedIssue.title}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                  <p className="text-foreground">{selectedIssue.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
                    <StatusBadge status={selectedIssue.status as IssueStatus} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Priority</h4>
                    <PriorityBadge priority={selectedIssue.priority as any} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Location</h4>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedIssue.address || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Reported</h4>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(selectedIssue.created_at), 'PPp')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Reported By</h4>
                    <p className="text-sm font-medium">{selectedIssue.reporter_name || 'Unknown'}</p>
                  </div>
                </div>
                
                {selectedIssue.assigned_to && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Assigned To</h4>
                    <p className="text-sm">{selectedIssue.assigned_to}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Update Status</h4>
                  
                  {!showResolutionForm ? (
                    <div className="flex flex-wrap gap-2">
                      {(['reported', 'in_progress', 'resolved'] as IssueStatus[]).map(status => (
                        <Button
                          key={status}
                          variant={selectedIssue.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleStatusChange(selectedIssue.id, status)}
                        >
                          {STATUS_LABELS[status]}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium text-foreground">Resolution Details</h4>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Resolution Summary (Optional)
                        </label>
                        <Textarea
                          placeholder="Briefly describe what was done to resolve this issue..."
                          value={resolutionDetails}
                          onChange={(e) => setResolutionDetails(e.target.value)}
                          className="min-h-24"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Message to Citizen (Optional)
                        </label>
                        <Textarea
                          placeholder="Add a personal message to the citizen about this resolution..."
                          value={resolvedMessage}
                          onChange={(e) => setResolvedMessage(e.target.value)}
                          className="min-h-20"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="gap-2 flex-1"
                          onClick={handleResolveIssue}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm & Send Notification
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowResolutionForm(false);
                            setResolutionDetails('');
                            setResolvedMessage('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {!selectedIssue.assigned_to && selectedIssue.status !== 'resolved' && (
                  <Button 
                    className="w-full gap-2"
                    onClick={() => handleAssign(selectedIssue.id)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign to Field Worker
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default AuthorityDashboard;
