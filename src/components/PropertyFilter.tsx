'use client';

import { useState } from 'react';

interface FilterOptions {
  type: string;
  minPrice: string;
  maxPrice: string;
  location: string;
}

interface PropertyFilterProps {
  onFilter: (filters: FilterOptions) => void;
  propertyTypes: string[];
}

export default function PropertyFilter({
  onFilter,
  propertyTypes,
}: PropertyFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    type: '',
    minPrice: '',
    maxPrice: '',
    location: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    const emptyFilters: FilterOptions = {
      type: '',
      minPrice: '',
      maxPrice: '',
      location: '',
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Cari Properti</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tipe Properti */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipe Properti
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Tipe</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lokasi
          </label>
          <input
            type="text"
            name="location"
            placeholder="Cari lokasi..."
            value={filters.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Harga Minimum */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Harga Min
          </label>
          <input
            type="number"
            name="minPrice"
            placeholder="Rp 0"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Harga Maksimum */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Harga Max
          </label>
          <input
            type="number"
            name="maxPrice"
            placeholder="Rp 9999999"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
