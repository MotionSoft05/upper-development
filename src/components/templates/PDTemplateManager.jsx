import React from "react";
import PropTypes from "prop-types";
import PDTemplate1 from "./PDTemplate1";

const PDTemplateManager = ({
  templateId,
  events,
  template,
  weatherData,
  currentTime,
  isPortrait,
  t,
  qrCodeUrl, // Add qrCodeUrl prop
}) => {
  // Por ahora solo tenemos Template1, pero aquí podrías agregar más templates
  // basándote en templateId
  return (
    <PDTemplate1
      events={events}
      template={template}
      weatherData={weatherData}
      currentTime={currentTime}
      isPortrait={isPortrait}
      t={t}
      qrCodeUrl={qrCodeUrl} // Pass qrCodeUrl to PDTemplate1
    />
  );
};

PDTemplateManager.propTypes = {
  templateId: PropTypes.string,
  events: PropTypes.array.isRequired,
  template: PropTypes.object,
  weatherData: PropTypes.object,
  currentTime: PropTypes.string.isRequired,
  isPortrait: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  qrCodeUrl: PropTypes.string, // Add to propTypes
};

export default PDTemplateManager;
