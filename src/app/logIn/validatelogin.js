// validatelogin.js

function validateLogin(email, password) {
  const errors = {};

  if (!email) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (password.length < 3) {
    errors.password = "La contraseña debe tener al menos 3 caracteres.";
  }

  return errors;
}

export default validateLogin;
