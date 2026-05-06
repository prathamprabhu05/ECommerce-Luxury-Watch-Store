import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      // EmailJS configuration
      // Replace these with your actual EmailJS credentials from https://www.emailjs.com/
      const SERVICE_ID = 'service_lc4nae4'; // e.g., 'service_abc123'
      const TEMPLATE_ID = 'template_65kff9a'; // e.g., 'template_xyz789'
      const PUBLIC_KEY = 'lsJcIc4ww1dc392iu'; // e.g., 'user_ABC123XYZ'

      // Send email using EmailJS
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: 'prathammprabhu5@gmail.com', // Your email
        },
        PUBLIC_KEY
      );

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Email sending failed:', error);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again or contact us directly at prathammprabhu5@gmail.com');
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['support@mywatches.com', 'sales@mywatches.com'],
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['Nitte, SH1, Karkala', 'Karnataka 574110, India'],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat - Sun: 10:00 AM - 4:00 PM'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl text-black mb-6 font-serif">Get in Touch</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have a question about our timepieces? Our expert team is here to help you find the
            perfect watch.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-lg"
          >
            <h2 className="text-3xl text-black mb-6 font-serif">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Messages */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Message sent successfully! We'll get back to you soon.</span>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-black mb-2 text-sm">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={status === 'sending'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-black mb-2 text-sm">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={status === 'sending'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-black mb-2 text-sm">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  disabled={status === 'sending'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-black mb-2 text-sm">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={status === 'sending'}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === 'sending'}
                whileHover={status !== 'sending' ? { scale: 1.02 } : {}}
                whileTap={status !== 'sending' ? { scale: 0.98 } : {}}
                className="w-full py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-xl hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {contactInfo.map(({ icon: Icon, title, details }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FDBA3A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#FDBA3A]" />
                  </div>
                  <div>
                    <h3 className="text-xl text-black mb-2">{title}</h3>
                    {details.map((detail) => (
                      <p key={detail} className="text-gray-600">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* WhatsApp Quick Contact */}

          </motion.div>
        </div>

        {/* Google Maps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-200 rounded-3xl overflow-hidden h-[500px]"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.6385042367986!2d74.99089737507607!3d13.211749987186847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbc5c3b8c9c3b3b%3A0x1e3f3f3f3f3f3f3f!2sNitte%2C%20Karnataka%20574110!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="MyWatches Location - Nitte, Karkala, Karnataka"
          />
        </motion.div>
      </div>
    </div>
  );
}
