import { motion } from 'motion/react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const footerLinks = {
    about: [
      { name: 'Our Story', page: 'about' },
      { name: 'Craftsmanship', page: 'about' },
      { name: 'Team', page: 'team' },
      { name: 'Careers', page: 'about' },
    ],
    customerService: [
      { name: 'FAQ', page: 'contact' },
      { name: 'Shipping', page: 'contact' },
      { name: 'Returns', page: 'contact' },
      { name: 'Warranty', page: 'contact' },
    ],
    policies: [
      { name: 'Terms of Service', page: 'contact' },
      { name: 'Privacy Policy', page: 'contact' },
      { name: 'Refund Policy', page: 'contact' },
      { name: 'Cookie Policy', page: 'contact' },
    ],
  };

  const socialLinks = [
    { Icon: Facebook, href: '#', label: 'Facebook' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-black text-white border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-serif">
                My<span className="text-[#FDBA3A]">Watches</span>
              </h3>
              <p className="text-white/60 leading-relaxed max-w-md">
                Discover timeless elegance with our curated collection of premium luxury watches.
                Each timepiece is crafted with precision and passion for those who appreciate the
                finest things in life.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/60">
                  <Phone className="w-4 h-4 text-[#FDBA3A]" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Mail className="w-4 h-4 text-[#FDBA3A]" />
                  <span className="text-sm">support@mywatches.com</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <MapPin className="w-4 h-4 text-[#FDBA3A]" />
                  <span className="text-sm">Nitte, SH1, Karkala, Karnataka 574110</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* About Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="mb-6 text-[#FDBA3A]">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-white/60 hover:text-[#FDBA3A] transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Service Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="mb-6 text-[#FDBA3A]">Customer Service</h4>
            <ul className="space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-white/60 hover:text-[#FDBA3A] transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Policies Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="mb-6 text-[#FDBA3A]">Policies</h4>
            <ul className="space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-white/60 hover:text-[#FDBA3A] transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-12 border-t border-white/10"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-xl mb-4">Subscribe to Our Newsletter</h4>
            <p className="text-white/60 mb-6 text-sm">
              Get exclusive access to new collections, special offers, and luxury watch news.
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A] transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-full hover:shadow-lg hover:shadow-[#FDBA3A]/50 transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Social Media & Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} MyWatches – All Rights Reserved
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm mr-2">Follow Us:</span>
            {socialLinks.map(({ Icon, label }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.2, y: -2 }}
                className="w-10 h-10 bg-white/10 hover:bg-[#FDBA3A] rounded-full flex items-center justify-center transition-colors group"
                aria-hidden="true"
              >
                <Icon className="w-4 h-4 text-white group-hover:text-black transition-colors" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
