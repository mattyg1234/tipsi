import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const TablePage: React.FC = () => {
  const { tableId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-tipsi-dark mb-4">
            Table {tableId}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to your table! This is where customers will order drinks and request songs.
          </p>
          
          <div className="card max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-tipsi-dark mb-4">
              Coming Soon!
            </h2>
            <p className="text-gray-600 mb-6">
              The table ordering interface is being built. This will include:
            </p>
            <ul className="text-left text-gray-600 space-y-2 mb-6">
              <li>• DJ Song Requests (€5)</li>
              <li>• Quick Shots (€5 each)</li>
              <li>• Bottle Service Menu</li>
              <li>• Secure Payment Processing</li>
            </ul>
            <div className="text-tipsi-red font-semibold">
              Stay tuned for the full experience!
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TablePage;

