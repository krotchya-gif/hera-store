// ============================================================
// MOCK SHIPPING & TRACKING SERVICE (RajaOngkir-style)
// Replace with real API calls when API key is available.
// ============================================================

export const CITIES = [
  { name: 'Jakarta', province: 'DKI Jakarta' },
  { name: 'Bogor', province: 'Jawa Barat' },
  { name: 'Depok', province: 'Jawa Barat' },
  { name: 'Tangerang', province: 'Banten' },
  { name: 'Bekasi', province: 'Jawa Barat' },
  { name: 'Bandung', province: 'Jawa Barat' },
  { name: 'Surabaya', province: 'Jawa Timur' },
  { name: 'Medan', province: 'Sumatera Utara' },
  { name: 'Makassar', province: 'Sulawesi Selatan' },
  { name: 'Semarang', province: 'Jawa Tengah' },
  { name: 'Yogyakarta', province: 'DI Yogyakarta' },
  { name: 'Malang', province: 'Jawa Timur' },
];

export const COURIERS = [
  { code: 'jne', name: 'JNE', service: 'Reguler', baseCostPerKg: 12000, est: '2-3 hari' },
  { code: 'jnt', name: 'J&T Express', service: 'EZ', baseCostPerKg: 14000, est: '1-2 hari' },
  { code: 'sicepat', name: 'SiCepat', service: 'Regular', baseCostPerKg: 11000, est: '1-2 hari' },
  { code: 'anteraja', name: 'Anteraja', service: 'Reguler', baseCostPerKg: 10000, est: '2-4 hari' },
  { code: 'tiki', name: 'TIKI', service: 'Reguler', baseCostPerKg: 13000, est: '2-3 hari' },
  { code: 'gosend', name: 'Gosend', service: 'Same Day', baseCostPerKg: 35000, est: 'Hari ini' },
];

const cityIndex = (city) => {
  const idx = CITIES.findIndex(c => c.name.toLowerCase() === (city || '').toLowerCase());
  return idx >= 0 ? idx : 0;
};

export const getShippingRates = async (origin, destination, weightGrams = 1000) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const originIdx = cityIndex(origin);
  const destIdx = cityIndex(destination);
  const distance = Math.abs(destIdx - originIdx) + 1;
  const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));

  return COURIERS.map(courier => {
    // Deterministic cost variation based on city distance
    const distanceMultiplier = 1 + (distance * 0.15);
    const cost = Math.round(courier.baseCostPerKg * weightKg * distanceMultiplier / 1000) * 1000;
    return {
      code: courier.code,
      name: courier.name,
      service: courier.service,
      cost,
      est: courier.est,
      weight: weightGrams,
    };
  });
};

const detectCourier = (trackingNumber) => {
  const upper = (trackingNumber || '').toUpperCase();
  if (upper.startsWith('JNE')) return 'JNE';
  if (upper.startsWith('J&T') || upper.startsWith('JNT')) return 'J&T Express';
  if (upper.startsWith('SPX') || upper.startsWith('SICEPAT')) return 'SiCepat';
  if (upper.startsWith('AJS')) return 'Anteraja';
  if (upper.startsWith('GOSEND')) return 'Gosend';
  return 'JNE';
};

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getTrackingHistory = async (trackingNumber) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const courier = detectCourier(trackingNumber);
  const hash = hashString(trackingNumber);
  const steps = [
    { status: 'Pesanan Diterima', description: 'Pesanan telah diterima oleh sistem', icon: 'Package' },
    { status: 'Pesanan Diproses', description: 'Pesanan sedang diproses oleh tim warehouse', icon: 'Clock' },
    { status: 'Pesanan Dikirim', description: `Pesanan telah diserahkan ke ${courier}`, icon: 'Truck' },
    { status: 'Dalam Perjalanan', description: 'Paket sedang dalam perjalanan ke kota tujuan', icon: 'MapPin' },
    { status: 'Pesanan Diterima', description: 'Paket telah diterima oleh penerima', icon: 'CheckCircle' },
  ];

  const today = new Date();
  const completedCount = (hash % steps.length) + 1;

  return steps.map((step, idx) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (steps.length - idx - 1));
    date.setHours(9 + (idx * 3), 0, 0);
    return {
      ...step,
      courier,
      date: date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      completed: idx < completedCount,
    };
  });
};
