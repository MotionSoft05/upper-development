import React, { useState } from "react";
import Select from "react-select";
import { ChromePicker } from "react-color";

const EditPantallaServicio = () => {
  const [fontColor, setFontColor] = useState("#000000");
  const [templateColor, setTemplateColor] = useState("#ffffff");
  const [selectedFontStyle, setSelectedFontStyle] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [screenNames, setScreenNames] = useState(["", "", ""]);
  const [view, setView] = useState("personalization");
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [showTemplateColorPicker, setShowTemplateColorPicker] = useState(false);

  const fontStyleOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Verdana", label: "Verdana" },
  ];

  const cityOptions = [
    { value: "new-york", label: "New York" },
    { value: "los-angeles", label: "Los Angeles" },
    { value: "chicago", label: "Chicago" },
    { value: "houston", label: "Houston" },
    { value: "miami", label: "Miami" },
  ];

  const handleFontColorChange = () => {
    setShowFontColorPicker(!showFontColorPicker);
  };

  const handleTemplateColorChange = () => {
    setShowTemplateColorPicker(!showTemplateColorPicker);
  };

  const handleColorChange = (color, setColor) => {
    setColor(color.hex);
  };

  const handleFontStyleChange = (selectedOption) => {
    setSelectedFontStyle(selectedOption);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
  };

  const handleScreenNameChange = (e, index) => {
    const updatedScreenNames = [...screenNames];
    updatedScreenNames[index] = e.target.value;
    setScreenNames(updatedScreenNames);
  };

  const PantallaServicio = () => {
    return (
      <div
        className="w-full h-full bg-red-100 grid grid-rows-6 gap-1"
        style={{ aspectRatio: "16 / 9" }}
      >
        <div className="grid grid-cols-3 gap-1 mb-1 h-full row-span-5">
          <div className="grid grid-rows-2 gap-1">
            <div className="bg-cyan-200 border-2 border-slate-300 p-1">
              IMAGEN
            </div>
            <div className="bg-cyan-200 border-2 border-slate-300 p-1">
              IMAGEN
            </div>
          </div>
          <div className="bg-green-100 col-span-2 border-2 border-slate-300 p-1">
            IMAGEN O VIDEO
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 h-full flex-grow row-span-1">
          <div className="bg-orange-200 border-2 border-slate-300 p-1">
            FECHA
          </div>
          <div className="bg-orange-200 border-2 border-slate-300 p-1">RSS</div>
          <div className="bg-orange-200 border-2 border-slate-300 p-1">
            CLIMA
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pl-10 md:px-32">
      <div className="flex justify-around mt-7">
        <button
          className={`mx-5 px-6 py-2 leading-5 transition-colors duration-200 transform rounded-md ${
            view === "personalization"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white hover:bg-gray-700"
          } focus:outline-none`}
          onClick={() => setView("personalization")}
        >
          Personalización del Template
        </button>
        <button
          className={`mx-5 px-6 py-2 leading-5 transition-colors duration-200 transform rounded-md ${
            view === "preview"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white hover:bg-gray-700"
          } focus:outline-none`}
          onClick={() => setView("preview")}
        >
          Vista Previa del Template
        </button>
      </div>

      {view === "personalization" && (
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7 pl-10 md:px-32">
          <h1 className="text-3xl font-bold text-white capitalize mb-4">
            Personalización del Template
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-4">
              <div>
                <label className="text-white dark:text-gray-200">
                  Color de letra
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={handleFontColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Seleccionar Color
                  </button>
                  {showFontColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <ChromePicker
                        color={fontColor}
                        onChange={(color) =>
                          handleColorChange(color, setFontColor)
                        }
                      />
                      <button
                        onClick={handleFontColorChange}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                      >
                        Listo
                      </button>
                    </div>
                  )}
                  <div
                    className="w-8 h-8 rounded-full ml-4"
                    style={{ backgroundColor: fontColor }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div>
                <label className="text-white dark:text-gray-200">
                  Color de la plantilla
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={handleTemplateColorChange}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Seleccionar Color
                  </button>
                  {showTemplateColorPicker && (
                    <div className="absolute z-10 mt-2">
                      <ChromePicker
                        color={templateColor}
                        onChange={(color) =>
                          handleColorChange(color, setTemplateColor)
                        }
                      />
                      <button
                        onClick={handleTemplateColorChange}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                      >
                        Listo
                      </button>
                    </div>
                  )}
                  <div
                    className="w-8 h-8 rounded-full ml-4"
                    style={{ backgroundColor: templateColor }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Estilo de texto
              </label>
              <Select
                options={fontStyleOptions}
                value={selectedFontStyle}
                onChange={handleFontStyleChange}
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200">
                Seleccionar Ciudad
              </label>
              <Select
                options={cityOptions}
                value={selectedCity}
                onChange={handleCityChange}
                placeholder="Seleccione una ciudad"
                className="w-full"
                isSearchable
                isClearable={false}
                required
              />
            </div>

            <div className="mb-4">
              <label className="text-white dark:text-gray-200 block mb-0.5">
                Nombres de pantallas
              </label>
              <div className="flex flex-col">
                {screenNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    placeholder={`Pantalla ${index + 1}`}
                    onChange={(e) => handleScreenNameChange(e, index)}
                    className="mb-2 w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button className="mx-5 px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700 focus:outline-none focus:bg-gray-600">
              Guardar
            </button>
          </div>
        </section>
      )}

      {view === "preview" && (
        <section className="max-w-4xl p-6 mx-auto rounded-md shadow-md bg-gray-800 mt-7">
          <h1 className="text-3xl font-bold text-white capitalize mb-4">
            Vista Previa del Template
          </h1>
          <div
            className="w-full h-0"
            style={{ paddingBottom: "56.25%", position: "relative" }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <PantallaServicio />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default EditPantallaServicio;
