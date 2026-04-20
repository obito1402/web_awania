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
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-cyan-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            🏠 Awania Property
          </h1>
          <Link
            href="/admin"
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Temukan Properti <span className="text-yellow-200">Impian</span> Anda
          </h1>
          <p className="text-xl md:text-2xl opacity-95 mb-2">
            Apartemen, Kostan, Kontrakan, dan Ruko berkualitas
          </p>
          <p className="text-lg opacity-90">
            dengan harga terjangkau dan lokasi strategis
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
