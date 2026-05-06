import { motion } from "motion/react";
import { Mail, Phone, Briefcase } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Sanath",
      role: "Frontend Developer",
      email: "sanath@mywatches.com",
      phone: "+1 234 567 8900",
      image: "",
    },
    {
      id: 2,
      name: "Ekaansh",
      role: "Frontend Developer",
      email: "ekaansh@mywatches.com",
      phone: "+1 234 567 8900",
      image: "",
    },
    {
      id: 3,
      name: "Pratham",
      role: "Backend Developer",
      email: "pratham@mywatches.com",
      phone: "+1 234 567 8900",
      image: "",
    },
    {
      id: 4,
      name: "Shashwath",
      role: "Backend Developer",
      email: "shashwath@mywatches.com",
      phone: "+1 234 567 8900",
      image: "",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl mb-6 font-serif"
          >
            Meet Our{" "}
            <span className="text-[#FDBA3A]">Team</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 leading-relaxed"
          >
            The passionate creators behind MyWatches.
          </motion.p>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-80 bg-gray-100 overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Name & Role - Fixed Height */}
                  <div className="mb-4 flex-shrink-0">
                    <h3 className="text-2xl text-black mb-2 font-serif">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[#FDBA3A]">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gray-200 mb-4" />

                  {/* Contact Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-[#FDBA3A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Email
                        </p>
                        <a
                          href={`mailto:${member.email}`}
                          className="text-sm text-gray-800 hover:text-[#FDBA3A] transition-colors break-all"
                        >
                          {member.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-[#FDBA3A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Phone
                        </p>
                        <a
                          href={`tel:${member.phone}`}
                          className="text-sm text-gray-800 hover:text-[#FDBA3A] transition-colors"
                        >
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Contact Button */}
                  <motion.a
                    href={`mailto:${member.email}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-xl hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Get in Touch</span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl text-black mb-6 font-serif">
              Want to{" "}
              <span className="text-[#FDBA3A]">Join Us?</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              We're always looking for talented individuals who
              share our passion for luxury timepieces and
              exceptional craftsmanship.
            </p>
            <motion.a
              href="mailto:careers@mywatches.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <Mail className="w-5 h-5" />
              careers@mywatches.com
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}