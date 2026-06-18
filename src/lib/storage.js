import { supabase } from './supabase';

// ============================================================
// IMAGE UPLOAD
// ============================================================

export const uploadProductImage = async (file, productId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `product_${productId}_${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadAvatarImage = async (file, userId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadPaymentProof = async (file, orderId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `payment_${orderId}_${Date.now()}.${fileExt}`;
  const filePath = `payments/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('payment-proofs').getPublicUrl(filePath);
  return data.publicUrl;
};

export const uploadBannerImage = async (file, prefix = 'banner') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${prefix}_${Date.now()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('banners')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
  return data.publicUrl;
};

export const deleteImage = async (bucket, path) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
};
