// ============================================================
// CSV EXPORT
// ============================================================

export const exportToCSV = (data, filename, headers) => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport');
    return;
  }

  // Get all keys from the first object if headers not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV header
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return csvHeaders.map(header => {
      let value = row[header] || '';
      
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    }).join(',');
  });

  // Combine header and rows
  const csvContent = [headerRow, ...rows].join('\n');

  // Create blob and download (with UTF-8 BOM)
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportOrdersToCSV = (orders) => {
  const headers = ['id', 'user_name', 'total', 'status', 'shipping_address', 'payment_method', 'tracking_number', 'created_at'];
  
  const formattedData = orders.map(order => ({
    id: order.id,
    user_name: order.user_name || 'Unknown',
    total: order.total || 0,
    status: order.status || 'pending',
    shipping_address: order.shipping_address ? `${order.shipping_address.full_name}, ${order.shipping_address.city}` : '',
    payment_method: order.payment_method || '',
    tracking_number: order.tracking_number || '',
    created_at: order.created_at || ''
  }));

  exportToCSV(formattedData, 'orders', headers);
};

export const exportProductsToCSV = (products) => {
  const headers = ['id', 'name', 'category', 'price', 'stock', 'status', 'sold_count', 'rating', 'created_at'];
  
  const formattedData = products.map(product => ({
    id: product.id,
    name: product.name || '',
    category: product.categories?.name || '',
    price: product.price || 0,
    stock: product.stock || 0,
    status: product.status || 'active',
    sold_count: product.sold_count || 0,
    rating: product.rating || 0,
    created_at: product.created_at || ''
  }));

  exportToCSV(formattedData, 'products', headers);
};

export const exportCustomersToCSV = (customers) => {
  const headers = ['id', 'full_name', 'email', 'phone', 'role', 'orders_count', 'total_spent', 'created_at'];
  
  const formattedData = customers.map(customer => ({
    id: customer.id,
    full_name: customer.full_name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    role: customer.role || 'customer',
    orders_count: customer.orders_count || 0,
    total_spent: customer.total_spent || 0,
    created_at: customer.created_at || ''
  }));

  exportToCSV(formattedData, 'customers', headers);
};

export const exportFinanceReportToCSV = (reportData, dateRange) => {
  const headers = ['Date', 'Orders', 'Revenue', 'Cost', 'Profit', 'Average Order'];
  
  const formattedData = reportData.map(day => ({
    Date: day.date,
    Orders: day.orders,
    Revenue: day.revenue,
    Cost: day.cost,
    Profit: day.profit,
    'Average Order': day.avgOrder
  }));

  exportToCSV(formattedData, `finance_report_${dateRange}`, headers);
};
