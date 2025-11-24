import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ title, children, id }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="container py-16"
    >
      {title && (
        <h2 className="text-3xl font-bold mb-8 border-l-4 border-indigo-500 pl-4">
          {title}
        </h2>
      )}
      {children}
    </motion.section>
  );
};

export default Section;
