import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Star, Heart, Share, Minus, Plus, Truck, Check, Package
} from 'lucide-react';

import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getProductById, getReviews, getProductRating } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import ProductQnA from '../components/ProductQnA';
import ShareButton from '../components/ShareButton';
import RecommendedProducts from '../components/RecommendedProducts';
import { Helmet } from 'react-helmet-async';

const ProductDetail = ({
  product,
  setCurrentPage,
  addToCart,
  setSelectedCategory,
  onBuyNow
}) => {
  const { id } = useParams();
  const productId = product?.id || (id ? Number(id) : null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('deskripsi');
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [productDetail, setProductDetail] = useState(product);
  const [loading, setLoading] = useState(!productDetail);
  const [showShare, setShowShare] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const reviewsLimit = 5;

  useEffect(() => {
    if (!productId) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        if (data) {
          setProductDetail(data);
          if (data.variants?.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviewsAndRatings = async () => {
      try {
        setReviewsLoading(true);
        setOffset(0);
        const [reviewsData, ratingData] = await Promise.all([
          getReviews(productId, reviewsLimit, 0),
          getProductRating(productId)
        ]);
        setReviews(reviewsData || []);
        if (ratingData) {
          setRatingInfo(ratingData);
        }
      } catch (error) {
        console.error('Error fetching reviews or ratings:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchDetail();
    fetchReviewsAndRatings();
  }, [productId]);

  const handleLoadMoreReviews = async () => {
    if (!productId) return;
    try {
      const nextOffset = offset + reviewsLimit;
      const nextReviews = await getReviews(productId, reviewsLimit, nextOffset);
      if (nextReviews?.length > 0) {
        setReviews(prev => [...prev, ...nextReviews]);
        setOffset(nextOffset);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
      addToast('Gagal memuat ulasan tambahan', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-200 rounded-xl aspect-square animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-12 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Produk tidak ditemukan atau tidak tersedia</p>
        <button onClick={() => setCurrentPage('home')} className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]">Kembali ke Beranda</button>
      </div>
    );
  }

  const p = productDetail;
  const productImages = p.images?.length > 0 ? p.images : [p.thumbnail];
  const variants = p.variants || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Helmet>
        <title>{`${p.name} | Hera Store`}</title>
        <meta name="description" content={p.description ? p.description.substring(0, 150) : `Beli ${p.name} dengan kualitas terbaik dan harga terjangkau hanya di Hera Store.`} />
        <meta name="keywords" content={`${p.name}, produk rumah tangga, hera store`} />
      </Helmet>
      <div className="text-sm text-gray-500 mb-4">
        <span className="cursor-pointer hover:text-[#16A34A]" onClick={() => setCurrentPage('home')}>Beranda</span>
        <span className="mx-2">&gt;</span>
        <span
          className="cursor-pointer hover:text-[#16A34A]"
          onClick={() => {
            if (p.category_id) {
              setSelectedCategory(p.category_id);
            }
            setCurrentPage('listing');
          }}
        >
          {p.categories?.name || 'Kategori'}
        </span>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800">{p.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Gallery */}
        <div>
          <div
            className="bg-gray-50 rounded-xl aspect-square flex items-center justify-center mb-4 relative overflow-hidden group"
            onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStart === null) return;
              const diff = touchStart - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  setSelectedImage((prev) => Math.min(productImages.length - 1, prev + 1));
                } else {
                  setSelectedImage((prev) => Math.max(0, prev - 1));
                }
              }
              setTouchStart(null);
            }}
          >
            <img src={productImages[selectedImage]} alt={p.name} className="w-full h-full object-contain p-8 transition group-hover:scale-110" />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => {
                  if (isInWishlist(p.id)) {
                    removeFromWishlist(p.id);
                    addToast('Dihapus dari wishlist', 'info');
                  } else {
                    addToWishlist(p);
                    addToast('Ditambahkan ke wishlist', 'success');
                  }
                }}
                className="p-2 bg-white rounded-full shadow"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(p.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition"
              >
                <Share className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            {productImages.slice(0, 4).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${selectedImage === idx ? 'border-[#16A34A]' : 'border-gray-200'}`}
              >
                <img src={img} alt={`Galeri ${product?.name || 'Produk'}`} className="w-full h-full object-contain p-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{p.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
              <span className="text-sm font-medium">{ratingInfo.average || p.rating || 0}</span>
            </div>
            <span className="text-sm text-blue-500 underline cursor-pointer">({ratingInfo.count || p.review_count || 0} ulasan)</span>
            <span className="text-sm text-gray-500">Terjual {p.sold_count}</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-[#16A34A]">{formatRupiah(p.price)}</span>
            <span className="text-base text-gray-400 line-through">{formatRupiah(p.original_price)}</span>
            <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">-{p.discount_percent}%</span>
          </div>

          {variants.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Pilih Varian</p>
              <div className="flex gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      selectedVariant === v
                        ? 'border-2 border-[#16A34A] bg-[#DCFCE7] text-[#15803D]'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-50" aria-label="Kurangi jumlah"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(99, qty + 1))} className="p-2 hover:bg-gray-50" aria-label="Tambah jumlah"><Plus className="w-4 h-4" /></button>
              </div>
              <span className="text-xs text-gray-500">Stok: {p.stock} tersedia</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => onBuyNow?.({ ...p, variant: selectedVariant, qty })}
              className="border-2 border-[#16A34A] text-[#16A34A] h-12 rounded-lg font-semibold hover:bg-[#DCFCE7] transition"
            >
              Beli Sekarang
            </button>
            <button
              onClick={() => addToCart({ ...p, variant: selectedVariant, qty })}
              className="bg-[#16A34A] text-white h-12 rounded-lg font-semibold hover:bg-[#15803D] transition"
            >
              + Keranjang
            </button>
          </div>

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#16A34A]" /> <span className="font-medium">Gratis Ongkir</span> <span className="text-gray-500">Min. belanja Rp100.000</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#16A34A]" /> <span className="font-medium">Pengembalian Mudah</span> <span className="text-gray-500">14 hari garansi</span></div>
            <div className="flex items-center gap-2"><Package className="w-4 h-4 text-[#16A34A]" /> <span className="font-medium">Dikirim dari</span> <span className="text-gray-500">Jakarta</span></div>
          </div>

          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">H</div>
              <div>
                <p className="font-medium text-sm">Hera Store</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                  <span className="text-xs text-gray-500">4.9 | 12K Produk</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-[#16A34A] text-[#16A34A] rounded-lg text-sm hover:bg-[#DCFCE7]">Chat</button>
              <button className="px-4 py-2 bg-[#16A34A] text-white rounded-lg text-sm hover:bg-[#15803D]">Kunjungi Toko</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {['deskripsi', 'ulasan', 'qna'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-[#16A34A] text-[#16A34A]' : 'text-gray-500'}`}
            >
              {tab === 'qna' ? 'Q&A' : tab === 'ulasan' ? `Ulasan (${ratingInfo.count || 0})` : 'Deskripsi'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'deskripsi' && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <p className="text-gray-700 mb-4">{p.description || 'Deskripsi produk tidak tersedia.'}</p>
          {p.specifications && (
            <table className="w-full text-sm mt-4">
              <tbody>
                {Object.entries(p.specifications).map(([key, value], idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 text-gray-500 w-1/3">{key}</td>
                    <td className="py-2 font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'ulasan' && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex gap-8 mb-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-800">{ratingInfo.average || 0}</p>
              <div className="flex text-[#FBBF24] my-2 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(Number(ratingInfo.average || 0)) ? 'text-[#FBBF24] fill-[#FBBF24]' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">{ratingInfo.count || 0} ulasan</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FBBF24]" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            {['Semua', '5 ★', '4 ★', '3 ★', 'Dengan Foto'].map((f) => (
              <button key={f} className="px-3 py-1 border border-gray-200 rounded-full text-sm hover:bg-gray-50">{f}</button>
            ))}
          </div>
          {reviewsLoading && reviews.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">Memuat ulasan...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">Belum ada ulasan untuk produk ini.</div>
          ) : (
            <>
              {reviews.map((r) => (
                <div key={r.id} className="border-b py-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#16A34A] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {r.profiles?.avatar ? (
                        <img src={r.profiles.avatar} alt={r.profiles.full_name || 'Pengguna'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        r.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.profiles?.full_name || 'Pengguna Hera Store'}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-[#FBBF24]">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3 h-3 ${idx < r.rating ? 'text-[#FBBF24] fill-[#FBBF24]' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{r.comment}</p>
                  {r.admin_reply && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2 ml-11 border-l-4 border-[#16A34A]">
                      <p className="text-xs font-bold text-gray-800">Respon Toko:</p>
                      <p className="text-xs text-gray-600 mt-1">{r.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
              {reviews.length < ratingInfo.count && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleLoadMoreReviews}
                    className="text-[#16A34A] font-semibold text-sm hover:underline py-2 px-4 rounded-lg border border-[#16A34A] hover:bg-[#DCFCE7]"
                  >
                    Muat Lebih Banyak Ulasan
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'qna' && (
        <ProductQnA productId={p.id} productName={p.name} />
      )}

      {/* Share Button */}
      {showShare && (
        <ShareButton
          product={p}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Similar Products */}
      <RecommendedProducts
        currentProduct={p}
        onProductClick={(product) => {
          setSelectedProduct(product);
          setCurrentPage('detail');
          window.scrollTo(0, 0);
        }}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default ProductDetail;
