import { PSTemplate1 } from "./PSTemplate1";
import { PSTemplate2 } from "./PSTemplate2";

const TemplateManager = ({ templateId, event, templates, currentHour, t }) => {
  const templateComponents = {
    1: PSTemplate1,
    2: PSTemplate2,
    // Añadir más templates según sea necesario
  };

  const SelectedTemplate = templateComponents[templateId] || PSTemplate1;

  return (
    <SelectedTemplate
      event={event}
      templates={templates}
      currentHour={currentHour}
      t={t}
    />
  );
};

export default TemplateManager;
