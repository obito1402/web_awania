'use client';

import { useEffect, useState } from 'react';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '@/lib/supabase';
import { Property, PropertyFormData } from '@/types/property';
import Link from 'next/link';

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    type: '',
    price_start: 0,
    price_end: 0,
    deposit: 0,
    location: '',
    address: '',
    area_size: '',
    bedrooms: 0,
    description: '',
    facilities: [],
    images: [],
  });
  const [facilitiesInput, setFacilitiesInput] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('price') || name === 'deposit' || name === 'bedrooms'
        ? parseInt(value) || 0
        : value,
    });
  };

  const handleAddFacility = () => {
    if (facilitiesInput.trim()) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facilitiesInput.trim()],
      });
      setFacilitiesInput('');
    }
  };

  const handleRemoveFacility = (index: number) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateProperty(editingId, formData);
        alert('Properti berhasil diupdate!');
      } else {
        await createProperty(formData);
        alert('Properti berhasil ditambahkan!');
      }

      setFormData({
        name: '',
        type: '',
        price_start: 0,
        price_end: 0,
        deposit: 0,
        location: '',
        address: '',
        area_size: '',
        bedrooms: 0,
        description: '',
        facilities: [],
        images: [],
      });
      setEditingId(null);
      setShowForm(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Terjadi kesalahan saat menyimpan properti');
    }
  };

  const handleEdit = (property: Property) => {
    setFormData({
      name: property.name,
      type: property.type,
      price_start: property.price_start,
      price_end: property.price_end || 0,
      deposit: property.deposit || 0,
      location: property.location,
      address: property.address,
      area_size: property.area_size,
      bedrooms: property.bedrooms || 0,
      description: property.description || '',
      facilities: property.facilities || [],
      images: property.images || [],
    });
    setEditingId(property.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus properti ini?')) {
      try {
        await deleteProperty(id);
        alert('Properti berhasil dihapus!');
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Terjadi kesalahan saat menghapus properti');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🏠 Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              Kembali ke Website
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Button Add */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              if (!showForm) {
                setFormData({
                  name: '',
                  type: '',
                  price_start: 0,
                  price_end: 0,
                  deposit: 0,
                  location: '',
                  address: '',
                  area_size: '',
                  bedrooms: 0,
                  description: '',
                  facilities: [],
                  images: [],
                });
              }
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Batal' : '+ Tambah Properti Baru'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingId ? 'Edit Properti' : 'Tambah Properti Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Properti */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Properti *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Apartemen Margonda"
                  />
                </div>

                {/* Tipe Properti */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Properti *
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Apartemen, Kostan, Ruko"
                  />
                </div>

                {/* Harga Mulai */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Mulai (Rp) *
                  </label>
                  <input
                    type="number"
                    name="price_start"
                    value={formData.price_start}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Harga Akhir */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Akhir (Rp)
                  </label>
                  <input
                    type="number"
                    name="price_end"
                    value={formData.price_end}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Deposit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deposit (Rp)
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Lokasi */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lokasi (Kota/Kecamatan) *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Depok, Bekasi"
                  />
                </div>

                {/* Luas Bangunan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Luas Bangunan *
                  </label>
                  <input
                    type="text"
                    name="area_size"
                    value={formData.area_size}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: 21-30 m²"
                  />
                </div>

                {/* Jumlah Kamar */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jumlah Kasur/Kamar
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Contoh: Jl. Margonda Raya No. 123, Pondok Cina..."
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Deskripsi tambahan properti..."
                />
              </div>

              {/* Fasilitas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fasilitas
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={facilitiesInput}
                    onChange={(e) => setFacilitiesInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFacility();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: AC, WiFi, Lemari..."
                  />
                  <button
                    type="button"
                    onClick={handleAddFacility}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Tambah
                  </button>
                </div>

                {/* Fasilitas List */}
                {formData.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{facility}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFacility(index)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update Properti' : 'Simpan Properti'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Properties Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading properti...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Tipe
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {properties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                        Belum ada properti. Silakan tambahkan properti baru.
                      </td>
                    </tr>
                  ) : (
                    properties.map((property) => (
                      <tr key={property.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {property.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {property.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Rp {property.price_start.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {property.location}
                        </td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(property)}
                            className="text-blue-600 hover:text-blue-900 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
