// Debug utilities for authentication issues

export const clearExpiredToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('user');
  console.log('Expired token cleared. Please login again.');
  window.location.href = '/admin/login';
};

export const checkTokenStatus = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const user = localStorage.getItem('user');
  
  console.log('=== Token Status ===');
  console.log('Token exists:', !!token);
  console.log('User type:', userType);
  console.log('User data exists:', !!user);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp && payload.exp < currentTime;
      
      console.log('Token payload:', payload);
      console.log('Token expires at:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date(currentTime * 1000));
      console.log('Is expired:', isExpired);
      
      if (isExpired) {
        console.log('Token is expired! Run clearExpiredToken() to fix this.');
      }
    } catch (error) {
      console.log('Invalid token format:', error);
    }
  }
};

// Make these available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearExpiredToken = clearExpiredToken;
  (window as any).checkTokenStatus = checkTokenStatus;
}
