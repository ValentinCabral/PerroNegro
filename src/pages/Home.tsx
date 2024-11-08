import React from 'react';
import { Link } from 'react-router-dom';
import { Dog, Star, Award, Gift } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Dog size={64} className="mx-auto mb-6 text-yellow-400" />
          <h1 className="text-5xl font-bold mb-4">Perro Negro Rewards</h1>
          <p className="text-xl text-gray-300">Premiamos tu fidelidad con descuentos exclusivos</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 text-center transform hover:scale-105 transition">
            <Star className="mx-auto mb-4 text-yellow-400" size={40} />
            <h3 className="text-xl font-semibold mb-2">Gana Puntos</h3>
            <p className="text-gray-400">Por cada compra acumula puntos para futuros descuentos</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 text-center transform hover:scale-105 transition">
            <Award className="mx-auto mb-4 text-yellow-400" size={40} />
            <h3 className="text-xl font-semibold mb-2">Beneficios Exclusivos</h3>
            <p className="text-gray-400">Accede a ofertas especiales y preventas exclusivas</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 text-center transform hover:scale-105 transition">
            <Gift className="mx-auto mb-4 text-yellow-400" size={40} />
            <h3 className="text-xl font-semibold mb-2">Canjea Recompensas</h3>
            <p className="text-gray-400">Utiliza tus puntos en tu próxima compra</p>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            to="/customer"
            className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition"
          >
            Comienza Ahora
          </Link>
        </div>
      </div>
    </div>
  );
}