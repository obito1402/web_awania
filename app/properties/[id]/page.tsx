'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import { getPropertyById } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

export default function PropertyDetail() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(Number(id));
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat properti...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Properti Tidak Ditemukan</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const handleWhatsAppClick = () => {
    if (!property.whatsapp_number) {
      alert('Nomor WhatsApp tidak tersedia');
      return;
    }
    const message = `Halo, saya ingin menanyakan tentang properti ${property.name}. Apakah masih tersedia?`;
    const whatsappUrl = `https://wa.me/62${property.whatsapp_number.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const currentImage =
    property.images && property.images.length > 0
      ? property.images[selectedImageIndex]
      : '/placeholder.jpg';

  const priceDisplay =
    property.price_end && property.price_end !== property.price_start
      ? `Rp ${formatPrice(property.price_start)} - Rp ${formatPrice(property.price_end)}`
      : `Rp ${formatPrice(property.price_start)}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            🏠 Awania Property
          </Link>
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
          >
            ← Kembali
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl overflow-hidden shadow-lg border border-emerald-200">
              <Image
                src={currentImage}
                alt={property.name}
                fill
                className="object-cover"
                unoptimized={currentImage.includes('supabase')}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
              {property.images && property.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {property.images.length}
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-blue-600 shadow-lg'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={image.includes('supabase')}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info & CTA */}
          <div>
            {/* Type Badge */}
            <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full font-semibold mb-4 text-sm shadow-lg">
              {property.type}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>

            {/* Price Highlight */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-l-4 border-emerald-600 p-4 rounded-lg mb-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Harga per Bulan</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">{priceDisplay}</p>
              {property.deposit && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Deposit:</span> Rp{' '}
                  {formatPrice(property.deposit)}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-green-200 transition-all text-center text-lg"
              >
                Chat via WhatsApp
              </button>
              <Link href="/" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all text-center text-lg block border-2 border-transparent hover:border-emerald-300">
                Cari Properti Lain
              </Link>
            </div>

            {/* Location */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                📍 Lokasi
              </p>
              <p className="text-gray-800 font-semibold">{property.location}</p>
              <p className="text-sm text-gray-600 mt-1">{property.address}</p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Spesifikasi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📐</span> Spesifikasi
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-semibold">Luas Ruangan</span>
                <span className="text-gray-900 font-bold">{property.area_size}</span>
              </div>
              {property.bedrooms && (
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600 font-semibold">Jumlah Kamar</span>
                  <span className="text-gray-900 font-bold">{property.bedrooms}</span>
                </div>
              )}
              {property.beds && (
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600 font-semibold">Jumlah Kasur</span>
                  <span className="text-gray-900 font-bold">{property.beds}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-semibold">Tipe</span>
                <span className="text-gray-900 font-bold">{property.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Status</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Tersedia
                </span>
              </div>
            </div>
          </div>

          {/* Fasilitas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">✨</span> Fasilitas
            </h2>
            {property.facilities && property.facilities.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {property.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    <span className="text-lg">✓</span>
                    <span className="text-emerald-900 font-semibold">{facility}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada fasilitas yang tercantum</p>
            )}
          </div>
        </div>

        {/* Deskripsi */}
        {property.description && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Deskripsi
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-xl p-8 text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-2">
            Tertarik dengan properti ini?
          </h3>
          <p className="text-emerald-50 mb-6 text-lg">
            Hubungi kami sekarang untuk mendapatkan informasi lebih lanjut
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 hover:shadow-lg transition-all text-lg"
          >
            Chat via WhatsApp
          </button>
        </div>
      </div>
    </main>
  );
}
