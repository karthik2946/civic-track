import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { IssuesProvider } from "./hooks/useIssues";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CitizenDashboard from "./pages/CitizenDashboard";
import TrackIssues from "./pages/TrackIssues";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AuthSelect from "./pages/AuthSelect";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { initializeMailService } from "./services/mailServiceInit";

// Initialize mail service on app startup
initializeMailService();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <IssuesProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthSelect />} />
              <Route path="/auth/:userType" element={<Auth />} />
              <Route 
                path="/citizen" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/track" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <TrackIssues />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/authority" 
                element={
                  <ProtectedRoute allowedRoles={['authority']}>
                    <AuthorityDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </IssuesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
