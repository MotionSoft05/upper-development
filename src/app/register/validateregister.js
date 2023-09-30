export const validateFirstName = (firstName) => {
  return firstName.trim() !== "" ? null : "El nombre no puede estar vacío";
};

export const validateLastName = (lastName) => {
  return lastName.trim() !== "" ? null : "El apellido no puede estar vacío";
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
    ? null
    : "Formato de correo electrónico inválido";
};

export const validatePhoneNumber = (phoneNumber) => {
  // Agrega la lógica de validación para el número de teléfono si es necesario
  // Retorna null si es válido, o un mensaje de error si no lo es
  return null;
};

export const validatePassword = (password) => {
  // Agrega la lógica de validación para la contraseña si es necesario
  // Retorna null si es válido, o un mensaje de error si no lo es
  return null;
};
