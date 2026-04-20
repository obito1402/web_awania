'use client';

import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilter from '@/components/PropertyFilter';
import { getProperties } from '@/lib/supabase';
import { Property } from '@/types/property';
import Link from 'next/link';

interface FilterOptions {
  type: string;
  minPrice: string;
  maxPrice: string;
  location: string;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    type: '',
    minPrice: '',
    maxPrice: '',
    location: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);

    let filtered = properties;

    if (newFilters.type) {
      filtered = filtered.filter((p) =>
        p.type.toLowerCase().includes(newFilters.type.toLowerCase())
      );
    }

    if (newFilters.location) {
      filtered = filtered.filter(
        (p) =>
          p.location
            .toLowerCase()
            .includes(newFilters.location.toLowerCase()) ||
          p.address
            .toLowerCase()
            .includes(newFilters.location.toLowerCase())
      );
    }

    if (newFilters.minPrice) {
      const minPrice = parseInt(newFilters.minPrice);
      filtered = filtered.filter((p) => p.price_start >= minPrice);
    }

    if (newFilters.maxPrice) {
      const maxPrice = parseInt(newFilters.maxPrice);
      filtered = filtered.filter((p) => p.price_start <= maxPrice);
    }

    setFilteredProperties(filtered);
  };

  const propertyTypes = [...new Set(properties.map((p) => p.type))];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🏠 Web Awania</h1>
          <Link
            href="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Temukan Properti Impian Anda
          </h1>
          <p className="text-lg opacity-90">
            Apartemen, Kostan, Kontrakan, dan Ruko berkualitas dengan harga
            terjangkau
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter */}
        <PropertyFilter
          onFilter={handleFilter}
          propertyTypes={propertyTypes}
        />

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading properti...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Tidak ada properti yang sesuai dengan kriteria pencarian Anda.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Menampilkan {filteredProperties.length} properti
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
