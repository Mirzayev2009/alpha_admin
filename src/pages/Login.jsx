// Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Framer Motion Variants
const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Stagger the children's animation start time
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      toast.error("Please enter both username and password.");
      setIsLoading(false);
      return;
    }

    // Simulate network delay for better UX and to show the loading state
    setTimeout(() => {
        // Simple check - you can change these credentials
        if (username === "alpha_Azizbek" && password === "alpha_admin1221") {
          localStorage.setItem("isLoggedIn", "true");
          toast.success("Login successful! Redirecting...");
          navigate("/admin");
        } else {
          toast.error("Invalid credentials. Please try again.");
        }
        setIsLoading(false);
    }, 700); // Increased delay for smoother effect
  };

  return (
    <div className="flex min-h-screen  items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="w-70 max-w-md shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-extrabold text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to manage registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.form 
                onSubmit={handleLogin} 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </motion.div>
              <motion.div className="space-y-2" variants={itemVariants}>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Secure Login"
                            )}
                        </Button>
                    </motion.div>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;