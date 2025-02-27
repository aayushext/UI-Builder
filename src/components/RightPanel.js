import { useState, useEffect } from "react";

const RightPanel = ({
  selectedComponent,
  onUpdateComponentProps,
  currentScreen,
  onUpdateScreenBackgroundColor,
  onDuplicateComponent,
}) => {
  // Local state for component properties
  const [text, setText] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [fontSize, setFontSize] = useState("");
  const [textColor, setTextColor] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [radius, setRadius] = useState("");
  const [pressedColor, setPressedColor] = useState("");
  const [hoverColor, setHoverColor] = useState("");
  const [maxRadius, setMaxRadius] = useState(0);

  // Local state for screen background color
  const [screenBackgroundColor, setScreenBackgroundColor] = useState(
    currentScreen?.backgroundColor || "#ffffff"
  );

  // Update local state when the selected component changes
  useEffect(() => {
    if (selectedComponent) {
      setText(selectedComponent.text || "");
      setX(selectedComponent.x || "");
      setY(selectedComponent.y || "");
      setWidth(selectedComponent.width || "");
      setHeight(selectedComponent.height || "");
      setFontSize(selectedComponent.fontSize || "");
      setTextColor(selectedComponent.textColor || "");
      setBackgroundColor(selectedComponent.backgroundColor || "");
      setRadius(selectedComponent.radius || "");
      if (selectedComponent.pressedColor !== undefined) {
        setPressedColor(selectedComponent.pressedColor || "");
      } else {
        setPressedColor("");
      }
      if (selectedComponent.hoverColor !== undefined) {
        setHoverColor(selectedComponent.hoverColor || "");
      } else {
        setHoverColor("");
      }
      setMaxRadius(
        Math.min(selectedComponent.width, selectedComponent.height) / 2
      );
    } else {
      setText("");
      setX("");
      setY("");
      setWidth("");
      setHeight("");
      setFontSize("");
      setTextColor("");
      setBackgroundColor("");
      setRadius("");
      setPressedColor("");
      setHoverColor("");
      setMaxRadius(0);
    }
  }, [selectedComponent]);

  // Update screen background color
  useEffect(() => {
    setScreenBackgroundColor(currentScreen?.backgroundColor || "#ffffff");
  }, [currentScreen]);

  const handleInputChange = (setter, value, isComponentProp = true) => {
    // Special handling for radius to enforce the limit
    if (setter === setRadius) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const limitedValue = Math.min(Math.max(numValue, 0), maxRadius); // Limit the value
        setter(limitedValue); // Set the limited value
        if (selectedComponent && isComponentProp) {
          onUpdateComponentProps(selectedComponent.id, {
            radius: limitedValue,
          });
        }
      } else {
        setter(""); // Allow empty input (interpreted as 0)
      }
    } else {
      setter(value);
      if (selectedComponent && isComponentProp) {
        const updatedProps = {};
        if (setter === setText) updatedProps.text = value;
        if (setter === setX) updatedProps.x = parseFloat(value) || 0;
        if (setter === setY) updatedProps.y = parseFloat(value) || 0;
        if (setter === setWidth) updatedProps.width = parseFloat(value) || 0;
        if (setter === setHeight) updatedProps.height = parseFloat(value) || 0;
        if (setter === setFontSize)
          updatedProps.fontSize = parseFloat(value) || 0;
        if (setter === setTextColor) updatedProps.textColor = value;
        if (setter === setBackgroundColor) updatedProps.backgroundColor = value;
        if (setter === setPressedColor) updatedProps.pressedColor = value;
        if (setter === setHoverColor) updatedProps.hoverColor = value; // Update hoverColor
        onUpdateComponentProps(selectedComponent.id, updatedProps);
      }
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

      {selectedComponent && (
        <>
          <h2 className="text-lg font-bold mb-2 mt-4">Component Properties</h2>

          {/* Add duplicate button here */}
          <button
            onClick={onDuplicateComponent}
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded mb-4 w-full">
            Duplicate Widget
          </button>

          {/* Text Input */}
          <div className="mb-4">
            <label
              htmlFor="text"
              className="block text-sm font-medium text-gray-700">
              Text
            </label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => handleInputChange(setText, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* X Position */}
          <div className="mb-4">
            <label
              htmlFor="x"
              className="block text-sm font-medium text-gray-700">
              X Position
            </label>
            <input
              type="number"
              id="x"
              value={x}
              step="0.1"
              onChange={(e) => handleInputChange(setX, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()} // Prevent deselection
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Y Position */}
          <div className="mb-4">
            <label
              htmlFor="y"
              className="block text-sm font-medium text-gray-700">
              Y Position
            </label>
            <input
              type="number"
              id="y"
              value={y}
              step="0.1"
              onChange={(e) => handleInputChange(setY, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()} // Prevent deselection
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Width */}
          <div className="mb-4">
            <label
              htmlFor="width"
              className="block text-sm font-medium text-gray-700">
              Width
            </label>
            <input
              type="number"
              id="width"
              value={width}
              step="0.1"
              onChange={(e) => handleInputChange(setWidth, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()} // Prevent deselection
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Height */}
          <div className="mb-4">
            <label
              htmlFor="height"
              className="block text-sm font-medium text-gray-700">
              Height
            </label>
            <input
              type="number"
              id="height"
              value={height}
              step="0.1"
              onChange={(e) => handleInputChange(setHeight, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()} // Prevent deselection
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <label
              htmlFor="fontSize"
              className="block text-sm font-medium text-gray-700">
              Font Size
            </label>
            <input
              type="number"
              id="fontSize"
              value={fontSize}
              onChange={(e) => handleInputChange(setFontSize, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Text Color */}
          <div className="mb-4">
            <label
              htmlFor="textColor"
              className="block text-sm font-medium text-gray-700">
              Text Color
            </label>
            <input
              type="color"
              id="textColor"
              value={textColor}
              onChange={(e) => handleInputChange(setTextColor, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Background Color */}
          <div className="mb-4">
            <label
              htmlFor="backgroundColor"
              className="block text-sm font-medium text-gray-700">
              Background Color
            </label>
            <input
              type="color"
              id="backgroundColor"
              value={backgroundColor}
              onChange={(e) =>
                handleInputChange(setBackgroundColor, e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {/* Radius */}
          <div className="mb-4">
            <label
              htmlFor="radius"
              className="block text-sm font-medium text-gray-700">
              Radius (Max: {maxRadius})
            </label>
            <input
              type="number"
              id="radius"
              value={radius}
              onChange={(e) => handleInputChange(setRadius, e.target.value)}
              min="0"
              max={maxRadius}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Conditional Pressed and Hover Colors (Only for Buttons) */}
          {selectedComponent && selectedComponent.type === "PySideButton" && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="pressedColor"
                  className="block text-sm font-medium text-gray-700">
                  Pressed Color
                </label>
                <input
                  type="color"
                  id="pressedColor"
                  value={pressedColor}
                  onChange={(e) =>
                    handleInputChange(setPressedColor, e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="hoverColor"
                  className="block text-sm font-medium text-gray-700">
                  Hover Color
                </label>
                <input
                  type="color"
                  id="hoverColor"
                  value={hoverColor}
                  onChange={(e) =>
                    handleInputChange(setHoverColor, e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}
        </>
      )}
    </aside>
  );
};

export default RightPanel;
