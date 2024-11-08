import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export function Button({
  children,
  loading,
  variant = 'primary',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-black text-black hover:bg-gray-50 focus:ring-black'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className} ${
        loading ? 'opacity-75 cursor-not-allowed' : ''
      } flex items-center justify-center space-x-2`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader className="animate-spin h-5 w-5" />
      ) : (
        <>
          {icon && <span className="h-5 w-5">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}