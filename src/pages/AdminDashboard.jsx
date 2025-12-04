import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Loader2,
  LogOut,
  Users,
  MessagesSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://alpha-backend-iieo.onrender.com";

const SUPABASE_URL = "https://hmjbepqisyfqctddgqwj.supabase.co";
const SUPABASE_ANON_KEY_n1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtamJlcHFpc3lmcWN0ZGRncXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTA1MjgsImV4cCI6MjA4MDE2NjUyOH0.xAjmb9xSutFL6JRuyblE-kn9fb06jzXyamgHEB1Ab_k";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtamJlcHFpc3lmcWN0ZGRncXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU5MDUyOCwiZXhwIjoyMDgwMTY2NTI4fQ.o-iPHOLzGqesJMwOjwWuX68WhlNPPi_XphxL8ulPaZc";

// Supabase client for registrations (using anon key)
const supabaseRegistrations = createClient(SUPABASE_URL, SUPABASE_ANON_KEY_n1);

// Supabase client for contact messages (using service key)
const supabaseContact = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("registrations");
  const [regFilter, setRegFilter] = useState("all");
  const [contactFilter, setContactFilter] = useState("all");
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
  const { data: registrations = [], isLoading: regLoading } = useQuery({
    queryKey: ["Alpha_registration_data", regFilter],
    queryFn: async () => {
      let q = supabaseRegistrations
        .from("Alpha_registration_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (regFilter === "done" || regFilter === "undone") {
        q = q.eq("status", regFilter);
      }

      const { data, error } = await q;
      if (error) throw new Error("Failed to fetch registrations");
      return Array.isArray(data) ? data : [];
    },
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

  // Fetch contact messages
  const { data: contacts = [], isLoading: contactLoading } = useQuery({
    queryKey: ["Alpha_contact", contactFilter],
    queryFn: async () => {
      let q = supabaseContact
        .from("Alpha_contact")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await q;
      if (error) throw new Error("Failed to fetch contacts");
      return Array.isArray(data) ? data : [];
    },
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });

  // Update registration status
  const updateRegStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(
        `${BASE_URL}/api/admin/registrations/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Alpha_registration_data"] });
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

  // Delete contact message
  const deleteContactMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabaseContact
        .from("Alpha_contact")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Alpha_contact"] });
      toast({
        title: "Message deleted",
        description: "Contact message has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact message.",
        variant: "destructive",
      });
    },
  });

  const handleRegStatusChange = (id, newStatus) => {
    updateRegStatusMutation.mutate({ id, status: newStatus });
  };

  const handleContactDelete = (id) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteContactMutation.mutate(id);
    }
  };

  const regUndoneCount = registrations.filter((r) => r.status === "undone").length;
  const regDoneCount = registrations.filter((r) => r.status === "done").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage registrations and contact messages
            </p>
          </motion.div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <MessagesSquare className="w-4 h-4" />
              Contact Messages
            </TabsTrigger>
          </TabsList>

          {/* REGISTRATIONS TAB */}
          <TabsContent value="registrations" className="space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-3xl font-bold">{registrations.length}</p>
                  </div>
                  <Users className="w-12 h-12 text-primary opacity-20" />
                </div>
              </Card>
              <Card className="p-6 border-l-4 border-l-warning">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-3xl font-bold">{regUndoneCount}</p>
                  </div>
                  <Clock className="w-12 h-12 text-warning opacity-20" />
                </div>
              </Card>
              <Card className="p-6 border-l-4 border-l-success">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-3xl font-bold">{regDoneCount}</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-success opacity-20" />
                </div>
              </Card>
            </motion.div>

            {/* Filter Tabs */}
            <Tabs value={regFilter} onValueChange={setRegFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="undone">Pending</TabsTrigger>
                <TabsTrigger value="done">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Registrations List */}
            {regLoading ? (
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
                  {registrations.map((reg, index) => (
                    <motion.div
                      key={reg.id}
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
                                <h3 className="text-xl font-semibold mb-1">{reg.name}</h3>
                                <Badge
                                  variant={reg.status === "done" ? "default" : "secondary"}
                                  className={
                                    reg.status === "done"
                                      ? "bg-success text-success-foreground"
                                      : "bg-warning text-warning-foreground"
                                  }
                                >
                                  {reg.status === "done" ? "Completed" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>{reg.email}</span>
                              </div>
                              {reg.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="w-4 h-4" />
                                  <span>{reg.phone}</span>
                                </div>
                              )}
                              {reg.country && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{reg.country}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(reg.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {reg.message && (
                              <div className="flex gap-2 text-sm pt-2 border-t">
                                <MessageSquare className="w-4 h-4 text-muted-foreground mt-1" />
                                <p className="text-muted-foreground">{reg.message}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex lg:flex-col gap-2">
                            <Button
                              onClick={() => handleRegStatusChange(reg.id, "done")}
                              disabled={reg.status === "done"}
                              variant={reg.status === "done" ? "outline" : "default"}
                              className="flex-1 lg:flex-none"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Done
                            </Button>
                            <Button
                              onClick={() => handleRegStatusChange(reg.id, "undone")}
                              disabled={reg.status === "undone"}
                              variant={reg.status === "undone" ? "outline" : "secondary"}
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
          </TabsContent>

          {/* CONTACTS TAB */}
          <TabsContent value="contacts" className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Contact Messages
                    </p>
                    <p className="text-3xl font-bold">{contacts.length}</p>
                  </div>
                  <MessagesSquare className="w-12 h-12 text-primary opacity-20" />
                </div>
              </Card>
            </motion.div>

            {/* Contact Messages List */}
            {contactLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : contacts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No contact messages found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {contacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{contact.name}</h3>
                              <p className="text-lg text-primary font-medium">{contact.subject}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>{contact.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(contact.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium mb-1">Message:</p>
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {contact.message}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Button
                              onClick={() => handleContactDelete(contact.id)}
                              variant="destructive"
                              disabled={deleteContactMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;