import { motion } from 'motion/react';
import { Award, Users, Globe, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Award,
      title: 'Quality',
      description: 'We source only the finest timepieces from renowned manufacturers worldwide.',
    },
    {
      icon: Users,
      title: 'Expertise',
      description: 'Our team brings decades of horological knowledge and passion to every interaction.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Serving watch enthusiasts in over 50 countries with dedication and care.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Combining traditional craftsmanship with cutting-edge technology.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '100+', label: 'Luxury Brands' },
    { value: '25+', label: 'Years Experience' },
    { value: '99%', label: 'Satisfaction Rate' },
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
            About <span className="text-[#FDBA3A]">MyWatches</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 leading-relaxed"
          >
            A legacy of excellence in luxury timepieces, dedicated to bringing you the world's finest
            watches since 1998.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl text-black mb-6 font-serif">Our Story</h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                Founded in 1998, MyWatches began as a small boutique with a simple mission: to make
                luxury timepieces accessible to discerning collectors and enthusiasts worldwide.
              </p>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                Over the past 25 years, we've grown into a globally recognized destination for premium
                watches, partnering with the most prestigious brands in horology.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Today, we continue to uphold our founding principles: authenticity, expertise, and
                exceptional service. Every watch we offer is carefully selected, authenticated, and
                backed by our commitment to quality.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1760163180940-eecde9eda36c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRjaCUyMGNyYWZ0c21hbnNoaXB8ZW58MXx8fHwxNzYzMDM3NjM1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Watch craftsmanship"
                className="w-full h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl text-[#FDBA3A] mb-2 font-serif">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl text-black mb-4 font-serif">Our Values</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FDBA3A]/10 rounded-full mb-4">
                  <Icon className="w-7 h-7 text-[#FDBA3A]" />
                </div>
                <h3 className="text-xl text-black mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1762551873818-9a39444014c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMHdhdGNoJTIwZGV0YWlsfGVufDF8fHx8MTc2MzA0MjYyOXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Swiss watch detail"
                className="w-full h-[500px] object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl mb-6 font-serif">
                <span className="text-[#FDBA3A]">Craftsmanship</span> & Precision
              </h2>
              <p className="text-white/80 text-lg mb-4 leading-relaxed">
                Every timepiece in our collection represents the pinnacle of horological artistry.
                From Swiss-made movements to hand-finished cases, we celebrate the meticulous
                attention to detail that defines luxury watchmaking.
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Our partnerships with legendary manufactures ensure that each watch meets the highest
                standards of precision, durability, and aesthetic excellence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
