// 从本地存储获取当前用户信息
export function userFromStorage() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = window.localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : { username: 'user' };
  } catch (error) {
    console.error('Failed to parse user data from storage:', error);
    return { username: 'user' };
  }
}