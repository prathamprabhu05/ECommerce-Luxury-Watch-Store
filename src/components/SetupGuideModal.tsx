import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: 'auth' | 'permission';
}

export const SetupGuideModal = ({ isOpen, onClose, errorType }: SetupGuideModalProps) => {
  const isAuthError = errorType === 'auth';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50"
          >
            <div className="bg-gradient-to-br from-[#1A1A1A] via-[#0A0A0A] to-black border border-[#FDBA3A]/20 rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#FDBA3A]/10 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-[#FDBA3A]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {isAuthError ? 'Admin Account Setup Required' : 'Firestore Rules Setup Required'}
                    </h2>
                    <p className="text-gray-400">Quick 2-minute fix</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {isAuthError ? (
                  <>
                    {/* Auth Error Instructions */}
                    <div className="bg-black/30 border border-[#FDBA3A]/10 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#FDBA3A] rounded-full flex items-center justify-center text-black font-bold">
                          1
                        </div>
                        <h3 className="text-lg font-semibold text-white">Register Admin Account</h3>
                      </div>
                      <div className="ml-10 space-y-3 text-gray-300">
                        <p>The admin account doesn't exist in Firebase yet.</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                          <li>Click <span className="text-[#FDBA3A] font-semibold">"Register"</span> or <span className="text-[#FDBA3A] font-semibold">"Sign Up"</span></li>
                          <li>Use email: <code className="bg-black/50 px-2 py-1 rounded text-[#FDBA3A]">admin@mywatches.in</code></li>
                          <li>Use password: <code className="bg-black/50 px-2 py-1 rounded text-[#FDBA3A]">mywatches</code></li>
                          <li>Complete registration</li>
                        </ol>
                      </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-300">
                          <p className="font-semibold mb-1">After registration, you'll get:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>"Welcome Back Admin!" message</li>
                            <li>Golden profile icon border</li>
                            <li>Admin Panel access</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Permission Error Instructions */}
                    <div className="bg-black/30 border border-[#FDBA3A]/10 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#FDBA3A] rounded-full flex items-center justify-center text-black font-bold">
                          1
                        </div>
                        <h3 className="text-lg font-semibold text-white">Deploy Firestore Rules</h3>
                      </div>
                      <div className="ml-10 space-y-3 text-gray-300">
                        <p>Your database needs security rules to allow admin operations.</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                          <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#FDBA3A] hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
                          <li>Select project: <code className="bg-black/50 px-2 py-1 rounded text-[#FDBA3A]">login-dbms</code></li>
                          <li>Go to <span className="font-semibold">Firestore Database → Rules</span></li>
                          <li>Copy content from <code className="bg-black/50 px-2 py-1 rounded text-[#FDBA3A]">/firestore.rules</code></li>
                          <li>Paste and click <span className="text-[#FDBA3A] font-semibold">"Publish"</span></li>
                        </ol>
                      </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-300">
                          <p className="font-semibold mb-1">After publishing rules:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Wait 1-2 minutes for deployment</li>
                            <li>Refresh your browser</li>
                            <li>Try the operation again</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Documentation Links */}
                <div className="border-t border-white/10 pt-6">
                  <p className="text-sm text-gray-400 mb-3">Need more help?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Check the file: /QUICK_FIX_INSTRUCTIONS.md in your project');
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                    >
                      <p className="text-sm font-semibold text-white mb-1">Quick Fix Guide</p>
                      <p className="text-xs text-gray-400">2-minute setup instructions</p>
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Check the file: /FIREBASE_SETUP_GUIDE.md in your project');
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                    >
                      <p className="text-sm font-semibold text-white mb-1">Detailed Setup</p>
                      <p className="text-xs text-gray-400">Complete guide with troubleshooting</p>
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FDBA3A] to-[#FDD665] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#FDBA3A]/20 transition-all"
                >
                  Got It!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
