import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const { signIn, resendVerificationEmail } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setShowVerifyModal(true);
          return;
        }
        throw error;
      }

      showNotification('Welcome back! You have signed in successfully.', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { error } = await resendVerificationEmail(email);
      if (error) throw error;
      showNotification('Verification email resent! Please check your inbox.', 'success');
      setShowVerifyModal(false);
    } catch (err) {
      showNotification(err.message || 'Failed to resend email', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500">Sign in to report or find lost items</p>
        </div>

        <div className="card p-8 bg-white">
          <Alert message={error} />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign up today
            </Link>
          </p>
        </div>
      </div>

      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onConfirm={() => setShowVerifyModal(false)}
        onCancel={handleResendVerification}
        title="Email Not Verified"
        message="Your account is not fully active. Please check your email and verify your account before signing in."
        confirmText="Back to Login"
        cancelText="Resend Email"
        type="warning"
      />
    </div>
  );
};

export default Login;
