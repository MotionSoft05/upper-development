// src/components/ComponentesReutilizables.js

import React from "react";
import Select from "react-select";
import { ChromePicker } from "react-color";
import { useTranslation } from "react-i18next";

export const ColorPicker = ({
  color,
  setColor,
  label,
  showPicker,
  setShowPicker,
}) => {
  const { t } = useTranslation();

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  return (
    <div className="mb-4">
      <div>
        <label className="text-white dark:text-gray-200">{label}</label>
        <div className="flex items-center relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
          >
            {t("screenService.selectColor")}
          </button>
          {showPicker && (
            <div className="absolute z-10 mt-2">
              <ChromePicker color={color} onChange={handleColorChange} />
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
              >
                {t("screenService.done")}
              </button>
            </div>
          )}
          <div
            className="w-8 h-8 rounded-full ml-4"
            style={{ backgroundColor: color }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export const FontStyleSelector = ({
  selectedFontStyle,
  setSelectedFontStyle,
  fontStyleOptions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <label className="text-white dark:text-gray-200 block mb-0.5">
        {t("screenService.fontStyle")}
      </label>
      <Select
        options={fontStyleOptions}
        value={selectedFontStyle}
        onChange={setSelectedFontStyle}
        placeholder={t("screenService.styletext")}
      />
    </div>
  );
};

export const CitySelector = ({
  selectedCity,
  setSelectedCity,
  cityOptions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <label className="text-white dark:text-gray-200">
        {t("screenService.city")}
      </label>
      <Select
        options={cityOptions}
        value={selectedCity}
        onChange={setSelectedCity}
        placeholder={t("screenService.selectCity")}
        className="w-full"
        isSearchable
        isClearable={false}
        required
      />
    </div>
  );
};

export const ScreenNameInputs = ({ screenNames, handleScreenNameChange }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <label className="text-white dark:text-gray-200 block mb-0.5">
        {t("screenService.screenName")}
      </label>
      <div className="flex flex-col">
        {screenNames.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            placeholder={`${t("screenService.screenName")} ${index + 1}`}
            onChange={(e) => handleScreenNameChange(e, index)}
            className="mb-2 w-full py-2 px-3 border rounded-lg bg-gray-700 text-white"
          />
        ))}
      </div>
    </div>
  );
};
