import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-amber-50 py-20 px-6 text-center md:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-6xl tracking-tight">
            Hungry? We've got you covered.
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Order food from your favorite local caterers and get it delivered hot & fast right to your doorstep.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            

           
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">Why Choose Bussin?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-bold text-lg text-gray-900">Super Fast Delivery</h3>
            <p className="text-sm text-gray-600 mt-2">Get your meals delivered hot in under 30 minutes.</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <div className="text-4xl mb-3">🍔</div>
            <h3 className="font-bold text-lg text-gray-900">Top Local Caterers</h3>
            <p className="text-sm text-gray-600 mt-2">Hand-picked selection of the best food in town.</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-bold text-lg text-gray-900">Live Order Tracking</h3>
            <p className="text-sm text-gray-600 mt-2">Know exactly where your food is every step of the way.</p>
          </div>
        </div>
      </section>
    </div>
  );
}