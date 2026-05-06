import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
  onGoogleLogin?: () => void;
}

export default function RegisterPage({ onNavigate, onRegister, onGoogleLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Regex patterns for validation
  const validation = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic empty check
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Password Match Check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // STRICT PASSWORD VALIDATION
    if (!validation.length || !validation.upper || !validation.lower || !validation.number || !validation.special) {
      setError('Password does not meet security requirements.');
      setLoading(false);
      return;
    }

    // Terms Check
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      await onRegister(formData.fullName, formData.email, formData.password);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl text-black mb-2 font-serif">Create Account</h1>
            <p className="text-gray-600">Join the MyWatches family</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-black mb-2 text-sm">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-black mb-2 text-sm">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-black mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements Checklist - Only shows if user has started typing */}
              {formData.password && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${validation.length ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="w-3 h-3" /> 8+ Characters
                    </div>
                    <div className={`flex items-center gap-1 ${validation.upper ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="w-3 h-3" /> Uppercase
                    </div>
                    <div className={`flex items-center gap-1 ${validation.lower ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="w-3 h-3" /> Lowercase
                    </div>
                    <div className={`flex items-center gap-1 ${validation.number ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="w-3 h-3" /> Number
                    </div>
                    <div className={`flex items-center gap-1 ${validation.special ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="w-3 h-3" /> Special Char
                    </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-black mb-2 text-sm">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setAcceptTerms(!acceptTerms)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  acceptTerms
                    ? 'bg-[#FDBA3A] border-[#FDBA3A]'
                    : 'border-gray-300 hover:border-[#FDBA3A]'
                }`}
              >
                {acceptTerms && <Check className="w-3 h-3 text-black" />}
              </button>
              <label className="text-sm text-gray-600 cursor-pointer" onClick={() => setAcceptTerms(!acceptTerms)}>
                I accept the{' '}
                <span className="text-[#FDBA3A] hover:text-[#f5a623]">Terms and Conditions</span> and{' '}
                <span className="text-[#FDBA3A] hover:text-[#f5a623]">Privacy Policy</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-xl hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#FDBA3A] hover:text-[#f5a623] transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-white/60 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}