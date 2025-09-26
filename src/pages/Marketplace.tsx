import React from 'react';
import { ShoppingBag, DollarSign, User } from 'lucide-react';

const Marketplace: React.FC = () => {
  const items = [
    {
      id: 1,
      title: "Traditional Pottery Set",
      price: "R450",
      seller: "Mary Mogale",
      location: "Tzaneen",
      description: "Handcrafted traditional pottery made by local artisan",
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Marula Oil Products",
      price: "R80",
      seller: "Limpopo Naturals",
      location: "Polokwane",
      description: "Pure marula oil for skin and hair care, locally sourced",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "African Art Prints",
      price: "R250",
      seller: "David Maluleke",
      location: "Mokopane",
      description: "Beautiful African-inspired art prints perfect for home decoration",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Local Marketplace</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card hover:shadow-lg transition">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-lg font-semibold text-limpopo-green">{item.price}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{item.seller}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
              </div>
              
              <button className="btn-primary w-full">
                Contact Seller
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;