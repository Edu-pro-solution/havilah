import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(`${apiUrl}/api/forgotpassword`, {
        email: identifier,
        identifier,
      });
      setMessage(
        typeof response.data === "string"
          ? response.data
          : response.data?.message || "Password reset request sent.",
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="Edana Schools" className="h-16 w-16 object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl text-foreground">Reset Password</CardTitle>
            <CardDescription>Enter your email to request a password reset.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message ? <div className="rounded-md border border-primary/20 bg-primary/10 p-3 text-sm text-primary">{message}</div> : null}
            {error ? <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

            <div className="space-y-2">
              <Label htmlFor="identifier">Email</Label>
              <Input
                id="identifier"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="school@example.com"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Sending..." : "Reset Password"}
            </Button>

            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
