// Validation utilities

export const validators = {
  required: (value) => {
    if (!value || value.toString().trim() === '') {
      return 'Field ini wajib diisi';
    }
    return null;
  },
  
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Format email tidak valid';
    }
    return null;
  },
  
  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(value.replace(/\D/g, ''))) {
      return 'Nomor telepon harus 10-13 digit';
    }
    return null;
  },
  
  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return `Minimal ${min} karakter`;
    }
    return null;
  },
  
  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return `Maksimal ${max} karakter`;
    }
    return null;
  },
  
  numeric: (value) => {
    if (!value) return null;
    if (isNaN(value)) {
      return 'Harus berupa angka';
    }
    return null;
  },
  
  positive: (value) => {
    if (!value) return null;
    if (Number(value) <= 0) {
      return 'Harus lebih besar dari 0';
    }
    return null;
  },
  
  postalCode: (value) => {
    if (!value) return null;
    const postalRegex = /^[0-9]{5}$/;
    if (!postalRegex.test(value)) {
      return 'Kode pos harus 5 digit';
    }
    return null;
  }
};

export const validateForm = (fields, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = fields[fieldName];
    const fieldErrors = [];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        fieldErrors.push(error);
        isValid = false;
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors[0]; // Only show first error
    }
  }
  
  return { isValid, errors };
};

export const validateField = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) {
      return error;
    }
  }
  return null;
};
