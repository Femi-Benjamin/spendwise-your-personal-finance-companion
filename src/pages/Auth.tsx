import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Authentication is disabled; prevent interactive sign-in/sign-up flows
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(false);
    toast({ title: 'Authentication disabled', description: 'Sign-in and sign-up are turned off in this build.' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Authentication Disabled</CardTitle>
            <CardDescription className="text-center">Sign-in and sign-up flows are turned off in this build.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">You can continue to use the app without authentication.</p>
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
