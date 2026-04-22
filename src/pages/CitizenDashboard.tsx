import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABELS, CATEGORY_ICONS, IssueCategory, IssuePriority, PRIORITY_LABELS } from '@/types/issue';
import { motion } from 'framer-motion';
import { Camera, MapPin, Upload, CheckCircle, AlertCircle, Loader2, Eye, LogOut, X } from 'lucide-react';
import { toast } from 'sonner';
import { useIssuesContext } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const CitizenDashboard = () => {
  const { issues, addIssue, isLoading: issuesLoading } = useIssuesContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as IssueCategory | '',
    priority: 'medium' as IssuePriority,
    address: '',
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use rear camera on mobile
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        
        // Flip horizontally to correct mirror effect
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.95);
        setImagePreview(imageData);
        stopCamera();
        toast.success('Image captured successfully!');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraReady(false);
  };

  const handleCancelCamera = () => {
    stopCamera();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          
          // Reverse geocode to get a proper address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            if (data.display_name) {
              setFormData(prev => ({ ...prev, address: data.display_name }));
              toast.success('Address detected from your location!');
            } else {
              setFormData(prev => ({ ...prev, address: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
              toast.success('Location captured! You can edit the address above.');
            }
          } catch {
            setFormData(prev => ({ ...prev, address: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
            toast.success('Location captured! You can edit the address above.');
          }
          setLocationLoading(false);
        },
        (error) => {
          setLocationLoading(false);
          toast.error('Unable to get location. Please enter address manually.');
        }
      );
    } else {
      setLocationLoading(false);
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const newIssue = await addIssue({
      title: formData.title,
      description: formData.description,
      category: formData.category as IssueCategory,
      priority: formData.priority,
      address: formData.address || 'Location not specified',
      image_url: imagePreview || undefined,
      lat: location?.lat,
      lng: location?.lng,
    });

    if (newIssue) {
      toast.success('Issue reported successfully! Track your complaint in the Track Issues page.', {
        action: {
          label: 'View Reports',
          onClick: () => navigate('/track'),
        },
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        address: '',
      });
      setImagePreview(null);
      setLocation(null);
    } else {
      toast.error('Failed to submit issue. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Get user's issues
  const userIssues = issues.filter(issue => issue.user_id === user?.id);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
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

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Report a Civic Issue
            </h1>
            <p className="text-muted-foreground">
              Help improve your community by reporting problems that need attention
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photo Evidence</Label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={startCamera}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Image
                </Button>
              </div>
              
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Photo evidence</p>
                      <p className="text-sm text-muted-foreground">Upload or capture a photo to help resolve your issue</p>
                    </div>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Camera Modal */}
            {isCameraActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-full max-w-md bg-background rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="relative bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full aspect-square object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    <button
                      type="button"
                      onClick={handleCancelCamera}
                      className="absolute top-4 right-4 w-10 h-10 bg-foreground/20 hover:bg-foreground/40 text-foreground rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {isCameraReady ? (
                      <>
                        <p className="text-sm text-muted-foreground text-center">
                          Position your camera to capture the issue clearly
                        </p>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancelCamera}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            className="flex-1 gradient-hero"
                            onClick={captureImage}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Capture
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Hidden Canvas for Image Capture */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Issue Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: IssueCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="input-civic">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as IssueCategory[]).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[cat]}</span>
                        <span>{CATEGORY_LABELS[cat]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Overflowing garbage bin on Main Street"
                className="input-civic"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail. Include how long it has been a problem and any other relevant information."
                className="input-civic min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: IssuePriority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="input-civic">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as IssuePriority[]).map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {PRIORITY_LABELS[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter address or area"
                  className="input-civic flex-1"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex-shrink-0"
                  onClick={getLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </Button>
              </div>
              {location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  GPS location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-6 text-base gradient-hero"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </form>
          
          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-secondary/50 rounded-xl"
          >
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              Tips for Effective Reporting
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Take clear photos that show the issue properly</li>
              <li>• Provide accurate location details for faster resolution</li>
              <li>• Be specific in your description about the problem</li>
              <li>• Check if the issue has already been reported to avoid duplicates</li>
            </ul>
          </motion.div>

          {/* My Recent Reports */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-6 bg-card rounded-xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Your Recent Reports</h3>
              <Link to="/track">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Eye className="w-4 h-4" />
                  View All
                </Button>
              </Link>
            </div>
            {issuesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : userIssues.length > 0 ? (
              <div className="space-y-3">
                {userIssues.slice(0, 3).map(issue => (
                  <div key={issue.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{CATEGORY_ICONS[issue.category as IssueCategory]}</span>
                      <div>
                        <p className="font-medium text-sm">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.address || 'No location'}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      issue.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.status === 'in_progress' ? 'In Progress' : 
                       issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reports yet. Submit your first civic issue above!
              </p>
            )}
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CitizenDashboard;
