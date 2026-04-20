'use client';

import { useEffect, useState } from 'react';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getFacilities,
  uploadPropertyImage,
} from '@/lib/supabase';
import { testUpload } from '@/lib/storage-setup';
import { Property, PropertyFormData, Facility } from '@/types/property';
import { formatPrice, formatPriceInput, parsePrice } from '@/lib/utils';
import Link from 'next/link';

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
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
    beds: 0,
    description: '',
    facilities: [],
    images: [],
  });
  const [priceStartDisplay, setPriceStartDisplay] = useState('');
  const [priceEndDisplay, setPriceEndDisplay] = useState('');
  const [depositDisplay, setDepositDisplay] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesData, facilitiesData] = await Promise.all([
        getProperties(),
        getFacilities(),
      ]);
      setProperties(propertiesData);
      setFacilities(facilitiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupStorage = async () => {
    try {
      setSetupMessage('Testing storage...');
      const testResult = await testUpload();

      if (testResult.success) {
        setSetupMessage('✅ ' + testResult.message);
        setStorageReady(true);
        setTimeout(() => setSetupMessage(''), 3000);
      } else {
        setSetupMessage('❌ ' + testResult.message);
      }
    } catch (error) {
      console.error('Setup error:', error);
      setSetupMessage('❌ Terjadi kesalahan');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle price inputs dengan formatting
    if (name === 'price_start') {
      const cleanValue = value.replace(/\D/g, '');
      setPriceStartDisplay(cleanValue ? formatPriceInput(cleanValue) : '');
      setFormData({
        ...formData,
        price_start: cleanValue ? parseInt(cleanValue) : 0,
      });
    } else if (name === 'price_end') {
      const cleanValue = value.replace(/\D/g, '');
      setPriceEndDisplay(cleanValue ? formatPriceInput(cleanValue) : '');
      setFormData({
        ...formData,
        price_end: cleanValue ? parseInt(cleanValue) : 0,
      });
    } else if (name === 'deposit') {
      const cleanValue = value.replace(/\D/g, '');
      setDepositDisplay(cleanValue ? formatPriceInput(cleanValue) : '');
      setFormData({
        ...formData,
        deposit: cleanValue ? parseInt(cleanValue) : 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]:
          (name === 'bedrooms' || name === 'beds') ? parseInt(value) || 0 : value,
      });
    }
  };

  const handleFacilityToggle = (facilityName: string) => {
    setFormData((prev) => {
      const newFacilities = prev.facilities.includes(facilityName)
        ? prev.facilities.filter((f) => f !== facilityName)
        : [...prev.facilities, facilityName];
      return { ...prev, facilities: newFacilities };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      setUploading(true);
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Generate temporary ID untuk upload
        const tempId = `temp-${Date.now()}-${i}`;
        const imageUrl = await uploadPropertyImage(file, tempId);
        newImages.push(imageUrl);
      }

      const allImages = [...uploadedImages, ...newImages];
      setUploadedImages(allImages);
      setFormData((prev) => ({
        ...prev,
        images: allImages,
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        images: uploadedImages,
      };

      if (editingId) {
        await updateProperty(editingId, dataToSave);
        alert('Properti berhasil diupdate!');
      } else {
        await createProperty(dataToSave);
        alert('Properti berhasil ditambahkan!');
      }

      handleResetForm();
      fetchData();
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
      beds: property.beds || 0,
      description: property.description || '',
      facilities: property.facilities || [],
      images: property.images || [],
      whatsapp_number: property.whatsapp_number || '',
    });
    setUploadedImages(property.images || []);
    setPriceStartDisplay(formatPrice(property.price_start));
    setPriceEndDisplay(property.price_end ? formatPrice(property.price_end) : '');
    setDepositDisplay(property.deposit ? formatPrice(property.deposit) : '');
    setEditingId(property.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus properti ini?')) {
      try {
        await deleteProperty(id);
        alert('Properti berhasil dihapus!');
        fetchData();
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Terjadi kesalahan saat menghapus properti');
      }
    }
  };

  const handleResetForm = () => {
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
      beds: 0,
      description: '',
      facilities: [],
      images: [],
      whatsapp_number: '',
    });
    setPriceStartDisplay('');
    setPriceEndDisplay('');
    setDepositDisplay('');
    setUploadedImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">🏠 Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/"
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
            >
              ← Kembali ke Website
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Storage Setup Alert */}
        {!storageReady && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-lg mb-2">
                  Storage Bucket Belum Siap
                </h3>
                <p className="text-amber-800 mb-3 text-sm">
                  Untuk upload foto, Anda perlu create bucket di Supabase Dashboard:
                </p>
                <ol className="text-amber-800 text-sm space-y-1 mb-4 ml-4 list-decimal">
                  <li>Buka: <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">app.supabase.com</a></li>
                  <li>Pilih project: <span className="font-mono">ntwpmquvegbzdvcqsjse</span></li>
                  <li>Storage → "+ New Bucket"</li>
                  <li>Name: <span className="font-mono bg-white px-2 py-1 rounded">property-images</span></li>
                  <li>Centang "Public bucket"</li>
                  <li>Create</li>
                </ol>
                <div className="flex gap-3">
                  <button
                    onClick={handleSetupStorage}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                  >
                    ✓ Test Storage Sekarang
                  </button>
                  <a
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 border border-amber-300 transition-colors text-sm"
                  >
                    → Buka Supabase
                  </a>
                </div>
                {setupMessage && (
                  <p className="mt-3 text-sm text-amber-700 font-semibold">{setupMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Button Add */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (showForm) {
                handleResetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all"
          >
            {showForm ? 'Batal' : '+ Tambah Properti Baru'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-emerald-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
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
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Contoh: Apartemen, Kostan, Ruko"
                  />
                </div>

                {/* Harga Mulai */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Mulai (Rp) *
                  </label>
                  <input
                    type="text"
                    name="price_start"
                    value={priceStartDisplay}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Harga Akhir */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga Akhir (Rp)
                  </label>
                  <input
                    type="text"
                    name="price_end"
                    value={priceEndDisplay}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Deposit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deposit (Rp)
                  </label>
                  <input
                    type="text"
                    name="deposit"
                    value={depositDisplay}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="0"
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
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Contoh: Depok, Bekasi"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="text"
                    name="whatsapp_number"
                    value={formData.whatsapp_number || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    required
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Contoh: 081234567890"
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
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Contoh: 21-30 m²"
                  />
                </div>

                {/* Jumlah Kamar */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jumlah Kamar
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jumlah Kasur
                  </label>
                  <input
                    type="number"
                    name="beds"
                    value={formData.beds || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
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
                  className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="Deskripsi tambahan properti..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Gambar
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-gray-600 mb-2">
                      {uploading ? 'Uploading...' : 'Klik untuk upload gambar atau drag & drop'}
                    </div>
                    <p className="text-xs text-gray-500">
                      Maksimal 5MB per file. Format: JPG, PNG
                    </p>
                  </label>
                </div>

                {/* Display uploaded images */}
                {uploadedImages.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Gambar Terpilih ({uploadedImages.length}):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fasilitas - Checkbox Grid */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Fasilitas
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {facilities.map((facility) => (
                    <label
                      key={facility.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility.name)}
                        onChange={() => handleFacilityToggle(facility.name)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{facility.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Selected Facilities Display */}
              {formData.facilities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Fasilitas Terpilih:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-200 transition-all font-semibold"
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">
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
                      <tr key={property.id} className="border-t hover:bg-emerald-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {property.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {property.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Rp {formatPrice(property.price_start)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {property.location}
                        </td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(property)}
                            className="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline transition-colors"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 hover:text-red-800 font-semibold hover:underline transition-colors"
                          >
                            🗑 Hapus
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
