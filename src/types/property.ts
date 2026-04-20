export interface Property {
  id: number;
  name: string;
  type: string;
  price_start: number;
  price_end?: number;
  deposit?: number;
  location: string;
  address: string;
  area_size: string;
  bedrooms?: number;
  description?: string;
  facilities: string[];
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  name: string;
  type: string;
  price_start: number;
  price_end?: number;
  deposit?: number;
  location: string;
  address: string;
  area_size: string;
  bedrooms?: number;
  description?: string;
  facilities: string[];
  images: string[];
}
