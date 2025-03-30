import React from "react";
import PropTypes from "prop-types";
import PTTemplate1Horizontal from "./PTTemplate1Horizontal";
import PTTemplate1Vertical from "./PTTemplate1Vertical";

const PTTemplateManager = ({ pantalla }) => {
  // Verificar si hay datos de pantalla
  if (!pantalla) return null;

  // Obtener orientación y template
  const orientacion = pantalla.orientacion || "horizontal";
  const template = pantalla.template || 1;

  // Renderizar template basado en tipo y orientación
  if (orientacion === "horizontal") {
    return <PTTemplate1Horizontal pantalla={pantalla} />;
  } else {
    return <PTTemplate1Vertical pantalla={pantalla} />;
  }
};

PTTemplateManager.propTypes = {
  pantalla: PropTypes.object.isRequired,
  weatherData: PropTypes.object, // Hacer opcional para compatibilidad con código existente
};

export default PTTemplateManager;
