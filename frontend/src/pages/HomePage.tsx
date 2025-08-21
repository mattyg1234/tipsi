import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  WifiIcon, 
  CreditCardIcon, 
  MusicalNoteIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import BusinessSignupForm from '../components/BusinessSignupForm';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: MusicalNoteIcon,
      title: 'Request Songs',
      description: 'Tap your NFC tag to request your favorite tracks directly to the DJ.',
      color: 'bg-purple-600'
    },
    {
      icon: CreditCardIcon,
      title: 'Order Drinks',
      description: 'Quick bottle service and shot orders with instant payment.',
      color: 'bg-red-600'
    },
    {
      icon: WifiIcon,
      title: 'NFC Magic',
      description: 'Just tap your phone or card - no apps to download.',
      color: 'bg-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo Placeholder */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-8"
            >
              <span className="text-black text-4xl font-bold">T</span>
            </motion.div>
            
            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              TIPSI
            </h1>
            
            {/* Slogan */}
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 font-light tracking-wide">
              <span className="text-white font-medium">Tip</span> • 
              <span className="text-white font-medium"> Tap</span> • 
              <span className="text-white font-medium"> Request</span>
            </p>
            
            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              The future of nightlife ordering. Use NFC tags to request songs, 
              order drinks, and experience seamless service without the wait.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/t/1"
                className="bg-white text-black font-bold py-4 px-8 rounded-lg hover:bg-gray-200 transition-all duration-300 text-lg inline-flex items-center space-x-2"
              >
                <WifiIcon className="w-6 h-6" />
                <span>Try Demo</span>
              </Link>
              
              <Link
                to="/admin/venue"
                className="border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-black transition-all duration-300 text-lg inline-flex items-center space-x-2"
              >
                <SparklesIcon className="w-6 h-6" />
                <span>Venue Setup</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to transform your nightlife experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300"
              >
                <div className={`w-20 h-20 ${feature.color} rounded-full flex items-center justify-center mb-6 mx-auto`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Signup Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              Business Owners
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Create your own NFC-powered venue with customizable menus and revenue tracking.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg p-8 shadow-2xl"
          >
            <BusinessSignupForm />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Venue?
            </h2>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the NFC revolution and give your guests the ultimate ordering experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/admin/venue"
                className="bg-white text-black font-bold py-4 px-8 rounded-lg hover:bg-gray-200 transition-all duration-300 text-lg"
              >
                Get Started
              </Link>
              
              <Link
                to="/dj-badge"
                className="border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-black transition-all duration-300 text-lg"
              >
                DJ Badge
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
