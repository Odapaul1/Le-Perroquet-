import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Mail, Lock, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSlowServer, setIsSlowServer] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      // If loading takes more than 4 seconds, assume the free-tier backend is waking up
      timeoutId = setTimeout(() => {
        setIsSlowServer(true);
      }, 4000);
    } else {
      setIsSlowServer(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setIsSlowServer(false);

    try {
      await login(data.email, data.password);
      
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err.response?.data);
      if (!err.response) {
        setError('Network error: Unable to connect to the server. The server might be waking up or offline. Please try again.');
      } else {
        const errorMessage = 
          err.response?.data?.error?.message || 
          err.response?.data?.message || 
          (err.response?.data?.errors && err.response.data.errors.length > 0 
            ? err.response.data.errors[0].msg 
            : 'Login failed. Please try again.');
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsSlowServer(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      
      <div className="w-full max-w-5xl flex flex-col md:flex-row overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl z-10 m-4">
        {/* Left Side - Visuals */}
        <div className="w-full md:w-1/2 p-12 hidden md:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-r border-white/10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/90 mb-8">
              <Globe className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold tracking-tight">Le Perroquet</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mt-12">
              Master French <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Faster Together
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-sm">
              Join our community of learners and instructors to elevate your French proficiency.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Interactive Learning</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Experience the new standard of language education with gamified lessons and real-time interactions.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {t('auth.login_title') || 'Welcome Back'}
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {t('auth.create_account') || 'Sign up for free'}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isSlowServer && !error && (
                <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-400">
                  <AlertDescription className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waking up the server, please hold on...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-5">
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-gray-300">{t('auth.email') || 'Email Address'}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 rounded-xl transition-all"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">{t('auth.password') || 'Password'}</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {t('auth.forgot_password') || 'Forgot password?'}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 rounded-xl transition-all"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] group border-0" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('auth.signing_in') || 'Signing in...'}
                  </>
                ) : (
                  <>
                    {t('auth.sign_in') || 'Sign In'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;