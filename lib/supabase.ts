import { createClient } from '@supabase/supabase-js';
import { Property, PropertyFormData, Facility } from '@/types/property';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions untuk properties
export const getProperties = async (): Promise<Property[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPropertyById = async (id: number): Promise<Property> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createProperty = async (property: PropertyFormData): Promise<Property> => {
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProperty = async (id: number, property: Partial<PropertyFormData>): Promise<Property> => {
  const { data, error } = await supabase
    .from('properties')
    .update({ ...property, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProperty = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Facilities functions
export const getFacilities = async (): Promise<Facility[]> => {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// Image upload functions - uses server-side API to bypass RLS
export const uploadPropertyImage = async (file: File, propertyId: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyId', propertyId);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.url) {
      console.error('Upload error:', result.error);
      throw new Error(result.error || 'Upload gagal');
    }

    console.log('Upload successful:', result.url);
    return result.url;
  } catch (error: unknown) {
    console.error('Error in uploadPropertyImage:', error);
    throw error;
  }
};

// Authentication functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  return data?.subscription;
};
