'use client';

import { Property } from '@/types/property';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const priceDisplay =
    property.price_end && property.price_end !== property.price_start
      ? `Rp ${property.price_start.toLocaleString('id-ID')} - Rp ${property.price_end.toLocaleString('id-ID')}`
      : `Rp ${property.price_start.toLocaleString('id-ID')}`;

  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]
      : '/placeholder.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-200">
        <Image
          src={imageUrl}
          alt={property.name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.jpg';
          }}
        />
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{property.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {property.location}
        </p>

        {/* Price */}
        <div className="bg-blue-50 p-2 rounded mb-3">
          <p className="text-lg font-bold text-blue-600">{priceDisplay}</p>
          {property.deposit && (
            <p className="text-xs text-gray-600">
              + Deposit Rp {property.deposit.toLocaleString('id-ID')}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Luas:</span> {property.area_size}
          </div>
          {property.bedrooms && (
            <div>
              <span className="font-semibold">Kamar:</span> {property.bedrooms}
            </div>
          )}
        </div>

        {/* Facilities */}
        {property.facilities && property.facilities.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">
              Fasilitas:
            </p>
            <div className="flex flex-wrap gap-1">
              {property.facilities.slice(0, 3).map((facility, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                >
                  {facility}
                </span>
              ))}
              {property.facilities.length > 3 && (
                <span className="text-xs text-gray-600">
                  +{property.facilities.length - 3} lainnya
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Lihat Detail
        </button>
      </div>
    </div>
  );
}
