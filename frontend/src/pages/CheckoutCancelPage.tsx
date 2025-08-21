import React from 'react';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';

const CheckoutCancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-tipsi-dark mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your order was not completed. No charges were made.
          </p>
          
          <div className="card max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-tipsi-dark mb-4">
              No Worries!
            </h2>
            <p className="text-gray-600">
              You can try again anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;

