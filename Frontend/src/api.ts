// Utility function to handle token expiration
const handleTokenExpiration = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('user');
  window.location.href = '/admin/login';
};

// api.ts
const API_BASE = 'https://synthetic-field-solutions.onrender.com';


export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}; 

// User registration with profilePic upload
export const registerUser = async (data: {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  mobileNumber?: string;
  address?: string;
  profilePic?: File;
}) => {
  const formData = new FormData();
  formData.append('userName', data.userName);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('fullName', data.fullName);
  if (data.mobileNumber) {
    formData.append('mobileNumber', data.mobileNumber);
  }
  if (data.address) {
    formData.append('address', data.address);
  }
  if (data.profilePic) {
    formData.append('profilePic', data.profilePic);
  }
  const res = await fetch(`${API_BASE}/users/register`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};


export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Logout user
export const logoutUser = async () => {
  return apiRequest('/users/logout', { method: 'GET' });
};

// Change password
export const changePassword = async (oldPassword: string, newPassword: string) => {
  return apiRequest('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
};

// Update user details (with optional profilePic upload)
export const updateUserDetails = async (details: { fullName?: string; userName?: string; mobileNumber?: string; address?: string; profilePic?: File }) => {
  const formData = new FormData();
  if (details.fullName) formData.append('fullName', details.fullName);
  if (details.userName) formData.append('userName', details.userName);
  if (details.mobileNumber !== undefined) formData.append('mobileNumber', details.mobileNumber);
  if (details.address !== undefined) formData.append('address', details.address);
  if (details.profilePic) formData.append('profilePic', details.profilePic);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/update-detail`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  console.log('Update response:', response);
  return response;
};

export const updateUserPreferences = async (preferences: { notifications?: boolean; language?: string; theme?: string }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/update-preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ preferences }),
  });
  if (!res.ok) throw new Error(await res.text());
  const response = await res.json();
  console.log('Preferences update response:', response);
  return response;
};

// Get current user
export const getCurrentUser = async () => {
  return apiRequest('/users/getcurrent-user', { method: 'GET' });
};

// Refresh access token
export const refreshToken = async () => {
  return apiRequest('/users/refreshToken', { method: 'POST' });
};

// --- TURF API ---

export const createTurf = async (formData: FormData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/turfs/create_turf`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateTurf = async (turfId: string, formData: FormData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/turfs/turf_update_details/${turfId}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteTurf = async (turfId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/turfs/turf_delete/${turfId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAllTurfs = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/getAll-Turfs`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Get turfs owned by the logged-in admin
export const getAdminTurfs = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/turfs/admin-turfs`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getTurfById = async (turfId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/turf/${turfId}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getTurfReviews = async (turfId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/turf/${turfId}/reviews`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const toggleTurfSlotStatus = async (turfId: string, time: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/turfs/toggle_slot/${turfId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ time }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- BOOKING API ---

export const bookTurf = async (turfId: string, data: { bookingDate: string; timeSlot: string }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/bookings/book_turf/${turfId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getBooking = async (bookingId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/bookings/get_booking/${bookingId}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAdminBookingHistory = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/bookings/get_booking_history`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getUserBookingHistory = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/bookings/get_booking_history`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const cancelBooking = async (bookingId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/bookings/cancel_booking/${bookingId}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};



export const submitRating = async (bookingId: string, rating: number, review?: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/users/bookings/submit_rating/${bookingId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ rating, review }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const isTurfAvailable = async (turfId: string, bookingDate: string, timeSlot: string) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ turfId, bookingDate, timeSlot }).toString();
  const res = await fetch(`${API_BASE}/users/bookings/isTurf_available?${params}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- ADMIN API ---

export const registerAdmin = async (formData: FormData) => {
  const res = await fetch(`${API_BASE}/admins/register-admin`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const loginAdmin = async (userName: string, password: string) => {
  const res = await fetch(`${API_BASE}/admins/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateAdminDetails = async (formData: FormData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/admin-update-details`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getCurrentAdmin = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/getcurrent-admin`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (errorText.includes('TokenExpiredError') || res.status === 401) {
      handleTokenExpiration();
    }
    throw new Error(errorText);
  }
  return res.json();
}; 

// Admin User Management API
export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/users`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (errorText.includes('TokenExpiredError') || res.status === 401) {
      handleTokenExpiration();
    }
    throw new Error(errorText);
  }
  return res.json();
};

export const getUserById = async (userId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/users/${userId}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateUserByAdmin = async (userId: string, userData: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteUserByAdmin = async (userId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/users/${userId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const toggleUserStatus = async (userId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/users/${userId}/toggle-status`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Admin Analytics API
export const getAnalyticsData = async () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);
  console.log('Making request to:', `${API_BASE}/admins/analytics`);
  
  const res = await fetch(`${API_BASE}/admins/analytics`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  console.log('Response status:', res.status);
  console.log('Response headers:', res.headers);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Error Response:', errorText);
    throw new Error(errorText);
  }
  
  const responseData = await res.json();
  console.log('API Response Data:', responseData);
  return responseData;
};

export const getRevenueData = async (period: string = 'monthly') => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/analytics/revenue?period=${period}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getBookingTrends = async (period: string = 'monthly') => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/analytics/bookings?period=${period}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Admin Settings API
export const changeAdminPassword = async (oldPassword: string, newPassword: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateAdminProfile = async (profileData: {
  userName?: string;
  companyName?: string;
  email?: string;
  mobileNumber?: string;
  adminPic?: File;
}) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  if (profileData.userName) formData.append('userName', profileData.userName);
  if (profileData.companyName) formData.append('companyName', profileData.companyName);
  if (profileData.email) formData.append('email', profileData.email);
  if (profileData.mobileNumber) formData.append('mobileNumber', profileData.mobileNumber);
  if (profileData.adminPic) formData.append('adminPic', profileData.adminPic);

  const res = await fetch(`${API_BASE}/admins/update-profile`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getSystemSettings = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/settings`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    if (errorText.includes('TokenExpiredError') || res.status === 401) {
      handleTokenExpiration();
    }
    throw new Error(errorText);
  }
  return res.json();
};

export const updateSystemSettings = async (settings: {
  bookingTimeLimit?: number;
  cancellationTimeLimit?: number;
  autoCompleteTime?: number;
  maxBookingsPerUser?: number;
  maintenanceMode?: boolean;
}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Recalculate all turf ratings (admin only)
export const recalculateAllTurfRatings = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/recalculate-ratings`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// Get detailed rating statistics for a specific turf (admin only)
export const getTurfRatingStats = async (turfId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/admins/turf-rating-stats/${turfId}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};






