// AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Mail, Phone, MapPin, MessageSquare, Loader2, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

// Base URL - will be replaced by user
const BASE_URL = "https://alpha-backend-iieo.onrender.com"

const AdminDashboard = () => {
  // Ensure filter state is correctly typed for JavaScript if you remove the <...>
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    sonnerToast.success("Logged out successfully");
    navigate("/login");
  };

  // Fetch registrations
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["registrations", filter],
    queryFn: async () => {
      const url = filter === "all" 
        ? `${BASE_URL}/api/admin/registrations`
        : `${BASE_URL}/api/admin/registrations?status=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch registrations");
        
      // --- FIX FOR "number 1 is not iterable" ERROR ---
      const result = await response.json();
      
      // Check if the result is an array, or if the array is nested under a 'data' key.
      if (Array.isArray(result)) {
        return result;
      }
      if (result && Array.isArray(result.data)) {
        return result.data;
      }
      // If the data is not an array, return an empty array as a safe fallback.
      return []; 
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`${BASE_URL}/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      // Note: Invalidate with the filter in mind, but base invalidate is fine too
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast({
        title: "Status updated",
        description: "Registration status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update registration status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const undoneCount = registrations.filter((r) => r.status === "undone").length;
  const doneCount = registrations.filter((r) => r.status === "done").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">Tour Registrations</h1>
            <p className="text-muted-foreground">Manage your tour registration requests</p>
          </motion.div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm text-muted-foreground mb-1">Total Registrations</p>
                <p className="text-3xl font-bold text-foreground">{registrations.length}</p>
                </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-warning">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-foreground">{undoneCount}</p>
                </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-success">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-foreground">{doneCount}</p>
                </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Tabs value={filter} onValueChange={(value) => setFilter(value)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="undone">Pending</TabsTrigger>
              <TabsTrigger value="done">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Registrations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : registrations.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No registrations found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {registrations.map((registration, index) => (
                <motion.div
                  key={registration.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {registration.name}
                            </h3>
                            <Badge
                              variant={registration.status === "done" ? "default" : "secondary"}
                              className={
                                registration.status === "done"
                                  ? "bg-success text-success-foreground"
                                  : "bg-warning text-warning-foreground"
                              }
                            >
                              {registration.status === "done" ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{registration.email}</span>
                          </div>
                          {registration.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{registration.phone}</span>
                            </div>
                          )}
                          {registration.country && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{registration.country}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(registration.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {registration.message && (
                          <div className="flex gap-2 text-sm pt-2 border-t">
                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-1" />
                            <p className="text-muted-foreground">{registration.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <Button
                          onClick={() => handleStatusChange(registration.id, "done")}
                          disabled={registration.status === "done" || updateStatusMutation.isPending}
                          variant={registration.status === "done" ? "outline" : "default"}
                          className="flex-1 lg:flex-none"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Done
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(registration.id, "undone")}
                          disabled={registration.status === "undone" || updateStatusMutation.isPending}
                          variant={registration.status === "undone" ? "outline" : "secondary"}
                          className="flex-1 lg:flex-none"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Mark Pending
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;