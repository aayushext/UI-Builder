import { useState, useEffect } from "react";
import { getComponentDefinitionByType } from "../utils/componentLoader";

const PropertyEditor = ({ property, value, onChange, component }) => {
  // Calculate max radius if needed
  const maxRadius = property.hasMaxRadius
    ? Math.min(component.width, component.height) / 2
    : null;

  switch (property.type) {
    case "text":
      return (
        <input
          type="text"
          id={property.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      );

    case "number":
      return (
        <input
          type="number"
          id={property.name}
          value={value}
          step={property.step || 0.1}
          min={property.min !== undefined ? property.min : undefined}
          max={maxRadius || property.max}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          onMouseDown={(e) => e.stopPropagation()}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      );

    case "color":
      return (
        <input
          type="color"
          id={property.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      );

    case "select":
      return (
        <select
          id={property.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          {property.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    default:
      return <div>Unknown property type: {property.type}</div>;
  }
};

const RightPanel = ({
  selectedComponent,
  onUpdateComponentProps,
  currentScreen,
  onUpdateScreenBackgroundColor,
  onDuplicateComponent,
}) => {
  // State for screen background color
  const [screenBackgroundColor, setScreenBackgroundColor] = useState(
    currentScreen?.backgroundColor || "#ffffff"
  );

  // Update screen background color when current screen changes
  useEffect(() => {
    setScreenBackgroundColor(currentScreen?.backgroundColor || "#ffffff");
  }, [currentScreen]);

  // Get the definition for the selected component
  const componentDefinition = selectedComponent
    ? getComponentDefinitionByType(selectedComponent.type)
    : null;

  // Handle property change
  const handlePropertyChange = (name, value) => {
    if (selectedComponent) {
      onUpdateComponentProps(selectedComponent.id, { [name]: value });
    }
  };

  return (
    <aside id="right-panel" className="w-64 bg-gray-200 p-4 overflow-auto">
      <h2 className="text-lg font-bold mb-2">Screen Properties</h2>
      <div className="mb-4">
        <label
          htmlFor="screenBackgroundColor"
          className="block text-sm font-medium text-gray-700">
          Background Color
        </label>
        <input
          type="color"
          id="screenBackgroundColor"
          value={screenBackgroundColor}
          onChange={(e) => onUpdateScreenBackgroundColor(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {selectedComponent && componentDefinition && (
        <>
          <h2 className="text-lg font-bold mb-2 mt-4">Component Properties</h2>

          <button
            onClick={onDuplicateComponent}
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded mb-4 w-full">
            Duplicate Widget
          </button>

          {/* Position and size properties are always available */}
          <div className="mb-4">
            <label
              htmlFor="x"
              className="block text-sm font-medium text-gray-700">
              X Position
            </label>
            <input
              type="number"
              id="x"
              value={selectedComponent.x}
              step="0.1"
              onChange={(e) =>
                handlePropertyChange("x", parseFloat(e.target.value) || 0)
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="y"
              className="block text-sm font-medium text-gray-700">
              Y Position
            </label>
            <input
              type="number"
              id="y"
              value={selectedComponent.y}
              step="0.1"
              onChange={(e) =>
                handlePropertyChange("y", parseFloat(e.target.value) || 0)
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="width"
              className="block text-sm font-medium text-gray-700">
              Width
            </label>
            <input
              type="number"
              id="width"
              value={selectedComponent.width}
              step="0.1"
              onChange={(e) =>
                handlePropertyChange("width", parseFloat(e.target.value) || 0)
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="height"
              className="block text-sm font-medium text-gray-700">
              Height
            </label>
            <input
              type="number"
              id="height"
              value={selectedComponent.height}
              step="0.1"
              onChange={(e) =>
                handlePropertyChange("height", parseFloat(e.target.value) || 0)
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Dynamically render property editors based on component definition */}
          {componentDefinition.properties.map((property) => (
            <div className="mb-4" key={property.name}>
              <label
                htmlFor={property.name}
                className="block text-sm font-medium text-gray-700">
                {property.label}
                {property.hasMaxRadius &&
                  ` (Max: ${
                    Math.min(
                      selectedComponent.width,
                      selectedComponent.height
                    ) / 2
                  })`}
              </label>
              <PropertyEditor
                property={property}
                value={selectedComponent[property.name]}
                onChange={(value) => handlePropertyChange(property.name, value)}
                component={selectedComponent}
              />
            </div>
          ))}
        </>
      )}
    </aside>
  );
};

export default RightPanel;
