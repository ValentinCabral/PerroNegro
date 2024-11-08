import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dog, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-black text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Dog size={32} />
          <span>Perro Negro</span>
        </NavLink>
        
        {user && (
          <div className="flex items-center space-x-6">
            {user.role === 'customer' && (
              <NavLink
                to="/customer"
                className={({ isActive }) =>
                  `flex items-center space-x-2 hover:text-gray-300 transition ${
                    isActive ? 'text-yellow-400' : ''
                  }`
                }
              >
                <User size={20} />
                <span>Mi Cuenta</span>
              </NavLink>
            )}
            
            {user.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-2 hover:text-gray-300 transition ${
                    isActive ? 'text-yellow-400' : ''
                  }`
                }
              >
                <Settings size={20} />
                <span>Administración</span>
              </NavLink>
            )}

            <button
              onClick={logout}
              className="flex items-center space-x-2 hover:text-gray-300 transition"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}