import React from "react";
import PropTypes from "prop-types";
import PDTemplate1Vertical from "./PDTemplate1Vertical";
import PDTemplate1Horizontal from "./PDTemplate1Horizontal";

const PDTemplateManager = ({
  templateId,
  events,
  template,
  weatherData,
  currentTime,
  isPortrait,
  t,
  qrCodeUrl,
  screenNumber,
}) => {
  // Determinar qué publicidad usar según la orientación
  const publicidad = isPortrait
    ? template?.publicidadLandscape || template?.publicidad
    : template?.publicidadPortrait || template?.publicidad;
  console.log("🚀 ~ PDTemplateManager.jsx:19 ~ publicidad:", publicidad);
  // Seleccionar la versión del template basado en la orientación
  const renderTemplate = () => {
    // Podemos expandir este switch en el futuro para manejar más templates
    switch (templateId) {
      case "template1":
      default:
        // Seleccionar vertical u horizontal basado en isPortrait
        return isPortrait ? (
          <PDTemplate1Vertical
            events={events}
            template={template}
            weatherData={weatherData}
            currentTime={currentTime}
            t={t}
            qrCodeUrl={qrCodeUrl}
            screenNumber={screenNumber}
            publicidad={publicidad}
          />
        ) : (
          <PDTemplate1Horizontal
            events={events}
            template={template}
            weatherData={weatherData}
            currentTime={currentTime}
            t={t}
            qrCodeUrl={qrCodeUrl}
            screenNumber={screenNumber}
            publicidad={publicidad}
          />
        );
    }
  };

  return renderTemplate();
};

PDTemplateManager.propTypes = {
  templateId: PropTypes.string,
  events: PropTypes.array.isRequired,
  template: PropTypes.object,
  weatherData: PropTypes.object,
  currentTime: PropTypes.string.isRequired,
  isPortrait: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  qrCodeUrl: PropTypes.string,
  screenNumber: PropTypes.number,
};

export default PDTemplateManager;
