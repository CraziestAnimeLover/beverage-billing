import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiPhone, FiCheckCircle, FiShield, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, otpLogin } = useAuth();
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(identifier, password);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please enter your registered mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtp('1234'); // Pre-fill demo OTP
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await otpLogin(identifier, otp);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (idVal, passVal) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-3xl shadow-xl shadow-indigo-500/10 mb-4">
          🍾
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
          Tota Ram Traders
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Dabua Colony, Faridabad • GST: 06AZHPK1822E1ZR
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {/* Quick Demo Fill Bar */}
          <div className="mb-6 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <FiShield className="text-indigo-400" /> Quick Demo Credentials (Click to load):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('9015088766', 'admin123')}
                className="text-left px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition"
              >
                <div>👑 <strong>Admin Dealer</strong></div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">9015088766 • admin123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('9811122233', 'sharma123')}
                className="text-left px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition"
              >
                <div>🏪 <strong>Sharma Store</strong></div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">9811122233 • sharma123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('9822233344', 'raj123')}
                className="text-left px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-medium transition"
              >
                <div>🏬 <strong>Raj Traders</strong></div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">9822233344 • raj123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('9833344455', 'abc123')}
                className="text-left px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition"
              >
                <div>🍹 <strong>ABC Restaurant</strong></div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">9833344455 • abc123</div>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => {
                setIsOtpMode(false);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
                !isOtpMode
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => {
                setIsOtpMode(true);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
                isOtpMode
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Mobile OTP Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {!isOtpMode ? (
            /* Standard Password Form */
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Number / Email
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition duration-150 disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
                <FiArrowRight />
              </button>
            </form>
          ) : (
            /* OTP Form */
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registered Customer Mobile
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 9811122233"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-slate-300">Enter OTP</label>
                    <span className="text-[10px] text-emerald-400 font-semibold">Demo OTP: 1234</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full text-center tracking-widest text-lg font-bold py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition duration-150"
              >
                {submitting
                  ? 'Verifying...'
                  : otpSent
                  ? 'Verify & Sign In'
                  : 'Send Demo OTP'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Closed B2B network. Retailers are registered directly by the beverage distributor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
