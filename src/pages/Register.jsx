import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock, User, Send, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { signUp, resendVerificationEmail, signOut } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!showVerifyModal || isVerified) return;

    // Record when the waiting screen started to distinguish new verification from legacy state
    const waitStartTime = Date.now();

    // Listen for auth state changes (syncs across tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email === formData.email) {
        // Only count if verified AFTER we started waiting
        const confirmedAt = new Date(session.user.email_confirmed_at).getTime();

        // If confirmed_at is recent (or if it just changed), it's a valid verification
        if (confirmedAt > waitStartTime - 10000) { // 10s buffer for clock drift
          setIsVerified(true);
          await signOut();
          window.location.hash = '';
          showNotification('Email verified successfully! You can now sign in.', 'success');
        }
      }
    });

    // Polling as a robust fallback
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === formData.email) {
        const confirmedAt = new Date(session.user.email_confirmed_at).getTime();
        if (confirmedAt > waitStartTime - 10000) {
          setIsVerified(true);
          await signOut();
          window.location.hash = '';
          clearInterval(interval);
        }
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [showVerifyModal, isVerified, formData.email, signOut]);

  const handleResend = async () => {
    try {
      const { error } = await resendVerificationEmail(formData.email);
      if (error) throw error;
      showNotification('Verification email resent! Please check your inbox.', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to resend email', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); 
      return;
    }

    setError(null); // Clear previous errors on new submit attempt
    setLoading(true);

    try {
      // Proactive check for duplicate email in public profiles
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        setError('This email is already registered.');
        setLoading(false);
        return;
      }

      const { data, error } = await signUp(formData.email.toLowerCase(), formData.password, formData.name);

      if (error) {
        if (error.message.includes('already registered') || error.status === 400) {
          setError('This email is already registered.');
          return;
        }
        throw error;
      }

      // Check if user object is returned but session is null (means verification required)
      if (data?.user && !data?.session) {
        setShowVerifyModal(true);
      } else if (data?.user && data?.session) {
        // If auto-confirmation is on, we still show the modal or redirect
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500">Join the campus lost & found network</p>
        </div>

        <div className="card p-8 bg-white">
          <Alert message={error} />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="input pl-10"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <Modal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setIsVerified(false);
        }}
        onConfirm={() => {
          if (isVerified) {
            navigate('/login');
          } else {
            setShowVerifyModal(false);
          }
        }}
        onCancel={isVerified ? null : handleResend}
        title={isVerified ? "Verification Successful" : "Waiting for Verification"}
        message={isVerified
          ? "Your email has been successfully verified. You can now sign in to your account."
          : `A verification email has been sent to ${formData.email}. Please check your inbox and confirm your email to continue.`
        }
        confirmText={isVerified ? "Sign In Now" : "Return to Login"}
        cancelText={isVerified ? null : "Resend Email"}
        type={isVerified ? "success" : "info"}
      />
    </div>
  );
};

export default Register;
