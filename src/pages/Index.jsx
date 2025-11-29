// Index.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-foreground mb-4">Tour Registration System</h1>
        <p className="text-xl text-muted-foreground mb-8">Manage your tour registrations with ease</p>
        <Link to="/login">
          <Button size="lg" className="text-lg px-8">
            Go to Admin Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
       {/* Link to login for testing the new animation */}
        
    </div>
  );
};

export default Index;