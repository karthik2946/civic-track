import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIssuesContext } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABELS, CATEGORY_ICONS, IssueCategory, IssueStatus, STATUS_LABELS, PRIORITY_LABELS, Issue } from '@/types/issue';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, List, LayoutGrid, Loader2, LogOut, X, Calendar, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrackIssues = () => {
  const { issues, isLoading } = useIssuesContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [transformedIssues, setTransformedIssues] = useState<any[]>([]);

  // Transform issues data to match component expectations and fetch user info
  useEffect(() => {
    const transformIssues = async () => {
      const transformed = await Promise.all(
        issues.map(async (issue: any) => {
          let reportedByName = 'You';
          
          // Try to get the full name of the person who reported the issue
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', issue.user_id)
              .single();
            
            if (profile?.full_name) {
              reportedByName = profile.full_name;
            }
          } catch (err) {
            console.error('Error fetching profile:', err);
          }

          return {
            ...issue,
            imageUrl: issue.image_url,
            reportedBy: issue.reporter_name || reportedByName,
            reportedAt: new Date(issue.created_at),
            location: {
              address: issue.address || 'Unknown',
              lat: issue.lat || 0,
              lng: issue.lng || 0,
            },
            address: issue.address,
            upvotes: 0,
            priority: issue.priority || 'medium',
          };
        })
      );
      
      setTransformedIssues(transformed);
    };

    if (issues.length > 0) {
      transformIssues();
    }
  }, [issues]);

  const filteredIssues = transformedIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusCounts = {
    all: transformedIssues.length,
    reported: transformedIssues.filter(i => i.status === 'reported').length,
    in_progress: transformedIssues.filter(i => i.status === 'in_progress').length,
    resolved: transformedIssues.filter(i => i.status === 'resolved').length,
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
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Track Your Issues
            </h1>
            <p className="text-muted-foreground">
              Monitor the status of your reported civic issues
            </p>
          </div>
          
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', 'reported', 'in_progress', 'resolved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === status 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_LABELS[status as IssueStatus]}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-black/10 text-xs">
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search issues by title, description, or location..."
                className="pl-10 input-civic"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 input-civic">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-1 border border-border rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredIssues.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
            }>
              {filteredIssues.map((issue, i) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedIssue(issue)}
                  className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary transition-all hover:shadow-md hover:scale-105 transform"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{CATEGORY_ICONS[issue.category as IssueCategory]}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-1">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{issue.description}</p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          issue.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {STATUS_LABELS[issue.status as IssueStatus]}
                        </span>
                        {issue.address && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {issue.address.length > 30 ? issue.address.slice(0, 30) + '...' : issue.address}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-primary font-medium">
                        <Eye className="w-4 h-4" />
                        Click to view full details
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No issues found</h3>
              <p className="text-muted-foreground">
                {transformedIssues.length === 0 
                  ? "You haven't reported any issues yet. Go to Report Issue to submit your first complaint."
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedIssue(null)}
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 overflow-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-auto z-50 shadow-lg"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <span className="text-3xl">{CATEGORY_ICONS[selectedIssue.category as IssueCategory]}</span>
                {selectedIssue.title}
              </h2>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image - Full Size */}
              {selectedIssue.imageUrl ? (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={selectedIssue.imageUrl} 
                    alt={selectedIssue.title}
                    className="w-full h-auto max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f3f3" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border border-border bg-muted p-8 flex items-center justify-center h-96">
                  <p className="text-muted-foreground">No image provided</p>
                </div>
              )}

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Status</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedIssue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    selectedIssue.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {STATUS_LABELS[selectedIssue.status as IssueStatus]}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Priority</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedIssue.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    selectedIssue.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    selectedIssue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {PRIORITY_LABELS[selectedIssue.priority]}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Category</p>
                <p className="text-foreground font-medium">{CATEGORY_LABELS[selectedIssue.category as IssueCategory]}</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Description</p>
                <p className="text-foreground whitespace-pre-wrap">{selectedIssue.description}</p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </p>
                <p className="text-foreground">{selectedIssue.address || selectedIssue.location?.address || 'N/A'}</p>
                {selectedIssue.location?.lat && selectedIssue.location?.lng && (
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {selectedIssue.location.lat.toFixed(4)}, {selectedIssue.location.lng.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Reported By */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Reported By
                </p>
                <p className="text-foreground">{selectedIssue.reportedBy || 'Anonymous'}</p>
              </div>

              {/* Reported At */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reported On
                </p>
                <p className="text-foreground">
                  {new Date(selectedIssue.reportedAt).toLocaleString()}
                </p>
              </div>

              {/* Assigned To */}
              {selectedIssue.assigned_to && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Assigned To</p>
                  <p className="text-foreground">{selectedIssue.assigned_to}</p>
                </div>
              )}

              {/* Resolved At */}
              {selectedIssue.resolved_at && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Resolved On</p>
                  <p className="text-foreground">
                    {new Date(selectedIssue.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Upvotes */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Upvotes</p>
                <p className="text-foreground font-medium text-lg">{selectedIssue.upvotes}</p>
              </div>

              {/* Close Button */}
              <Button 
                onClick={() => setSelectedIssue(null)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      <Footer />
    </div>
  );
};

export default TrackIssues;
