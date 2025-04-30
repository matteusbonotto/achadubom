const FIXED_CREDENTIALS = {
  email: 'admin',
  password: '1234'
};

export const login = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (email === FIXED_CREDENTIALS.email && password === FIXED_CREDENTIALS.password) {
    const user = {
      id: '1',
      email: FIXED_CREDENTIALS.email,
      name: 'Administrador'
    };
    localStorage.setItem('user', JSON.stringify(user));
    return { success: true, user };
  }

  throw new Error('Credenciais inválidas');
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return !!user;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}; 