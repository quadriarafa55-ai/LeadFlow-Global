import React, { useState } from 'react';
import { 
  Globe2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to format auth errors to display error.message or JSON.stringify(error) directly
  const getExactErrorMessage = (err: any): string => {
    if (!err) return 'Unknown error occurred.';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (isForgotPassword) {
      setLoading(true);
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });

        if (resetError) {
          setError(resetError.message || JSON.stringify(resetError));
        } else {
          setSuccessMessage('Password reset link sent to your email.');
        }
      } catch (err: any) {
        setError(err?.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!name) {
        setError('Please enter your full name.');
        return;
      }
    }

    setLoading(true);

    if (isRegister) {
      // Strict try/catch block for Registration (signUp)
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: { full_name: name.trim() }
          }
        });

        if (signUpError) {
          setError(signUpError.message || JSON.stringify(signUpError));
          return;
        }

        if (!data || !data.user) {
          setError('Registration response was empty. Please check your details or try again.');
          return;
        }

        // Successful registration -> Transition to Onboarding Wizard
        onLogin({
          name: name.trim(),
          email: email.trim(),
          planName: 'Starter Plan',
          leadsUsed: 0,
          leadsLimit: 500,
          isOnboarded: false,
          isTrialActive: false,
          trialDaysLeft: 14,
          paymentFailed: false,
          connectedGmail: false,
          connectedWhatsApp: false,
        });
      } catch (err: any) {
        setError(err?.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    } else {
      // Strict try/catch block for Login (signInWithPassword)
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (signInError) {
          setError(signInError.message || JSON.stringify(signInError));
          return;
        }

        if (!data || !data.user) {
          setError('Invalid email or password. Please check your details or register.');
          return;
        }

        const userFullName = data.user.user_metadata?.full_name || email.split('@')[0];

        // Successful login
        onLogin({
          name: userFullName,
          email: email.trim(),
          planName: 'Starter Plan',
          leadsUsed: 42,
          leadsLimit: 500,
          isOnboarded: true,
          isTrialActive: true,
          trialDaysLeft: 14,
          paymentFailed: false,
          connectedGmail: true,
          connectedWhatsApp: true,
        });
      } catch (err: any) {
        setError(err?.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 shadow-xl shadow-cyan-500/20 mb-4 border border-cyan-500/30">
            <Globe2 className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            LeadFlow <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30">GLOBAL</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2">
            Autonomous B2B Lead-Generation & Automated Outreach SaaS
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">
                {isForgotPassword ? 'Reset Password' : isRegister ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-400">
                {isForgotPassword ? 'Enter your email to receive a reset link' : isRegister ? 'Start your 14-day free trial' : 'Access your global lead generation dashboard'}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Clean Notification Banners */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium animate-in fade-in flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed break-words font-mono text-[11px]">{error}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setError('')} 
                className="text-red-400/80 hover:text-red-200 p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start justify-between gap-2.5 animate-in fade-in">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSuccessMessage('')} 
                className="text-emerald-400/80 hover:text-emerald-200 p-0.5 rounded cursor-pointer shrink-0 transition-colors"
                aria-label="Dismiss success message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && !isForgotPassword && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={loading}
                    required={isRegister}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={loading}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  {!isRegister && (
                    <button 
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={loading}
                    required={!isForgotPassword}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-12 py-3 text-xs md:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {isRegister && !isForgotPassword && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={loading}
                    required={isRegister}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-12 py-3 text-xs md:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isForgotPassword ? 'Send Reset Instructions' : isRegister ? 'Create Account & Start' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-2">
            {isForgotPassword ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs text-cyan-400 hover:underline cursor-pointer font-semibold disabled:opacity-50"
              >
                Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
                <span className="text-cyan-400 font-semibold underline underline-offset-2">
                  {isRegister ? 'Sign In' : 'Register Now'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Enterprise-Grade 256-Bit SSL Encryption & SOC2 Compliance</span>
        </div>
      </div>
    </div>
  );
};
