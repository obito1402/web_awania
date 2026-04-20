'use client';

import { Property } from '@/types/property';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const priceDisplay =
    property.price_end && property.price_end !== property.price_start
      ? `Rp ${formatPrice(property.price_start)} - Rp ${formatPrice(property.price_end)}`
      : `Rp ${formatPrice(property.price_start)}`;

  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]
      : '/placeholder.jpg';

  const handleWhatsAppClick = () => {
    if (!property.whatsapp_number) {
      alert('Nomor WhatsApp tidak tersedia');
      return;
    }
    const message = `Halo, saya ingin menanyakan tentang properti ${property.name}`;
    const whatsappUrl = `https://wa.me/62${property.whatsapp_number.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-emerald-50">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gradient-to-br from-emerald-100 to-cyan-100">
        <Image
          src={imageUrl}
          alt={property.name}
          fill
          className="object-cover"
          unoptimized={imageUrl.includes('supabase')}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.jpg';
          }}
        />
        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          {property.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{property.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          📍 {property.location}
        </p>

        {/* Price */}
        <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-3 rounded-lg mb-4 border border-emerald-200">
          <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {priceDisplay}
          </p>
          {property.deposit && (
            <p className="text-xs text-gray-600 mt-1">
              + Deposit Rp {formatPrice(property.deposit)}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-700">
          <div className="bg-gray-50 p-2 rounded-lg">
            <span className="font-semibold text-emerald-700">Luas:</span> {property.area_size}
          </div>
          {property.bedrooms && (
            <div className="bg-gray-50 p-2 rounded-lg">
              <span className="font-semibold text-emerald-700">Kamar:</span> {property.bedrooms}
            </div>
          )}
          {property.beds && (
            <div className="bg-gray-50 p-2 rounded-lg">
              <span className="font-semibold text-emerald-700">Kasur:</span> {property.beds}
            </div>
          )}
        </div>

        {/* Facilities */}
        {property.facilities && property.facilities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              ✨ Fasilitas:
            </p>
            <div className="flex flex-wrap gap-1">
              {property.facilities.slice(0, 3).map((facility, i) => (
                <span
                  key={i}
                  className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium"
                >
                  {facility}
                </span>
              ))}
              {property.facilities.length > 3 && (
                <span className="text-xs text-emerald-600 font-semibold">
                  +{property.facilities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleWhatsAppClick}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-200 transition-all text-center"
          >
            Chat via WhatsApp
          </button>
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all text-center"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
