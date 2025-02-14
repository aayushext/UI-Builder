import { useState, useEffect } from "react";

const RightPanel = ({
  selectedComponent,
  onUpdateComponentProps,
  centerPanelBackgroundColor,
  onUpdateCenterPanelBackgroundColor,
}) => {
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

      // Only for buttons
      if (selectedComponent.pressedColor !== undefined) {
        setPressedColor(selectedComponent.pressedColor || "");
      } else {
        setPressedColor("");
      }
    }
  }, [selectedComponent]);

  const handleInputChange = (setter, value, isComponentProp = true) => {
    setter(value);

    if (selectedComponent && isComponentProp) {
      const updatedProps = {};
      if (setter === setText) updatedProps.text = value;
      if (setter === setX) updatedProps.x = parseInt(value, 10);
      if (setter === setY) updatedProps.y = parseInt(value, 10);
      if (setter === setWidth) updatedProps.width = parseInt(value, 10);
      if (setter === setHeight) updatedProps.height = parseInt(value, 10);
      if (setter === setFontSize) updatedProps.fontSize = parseInt(value, 10);
      if (setter === setTextColor) updatedProps.textColor = value;
      if (setter === setBackgroundColor) updatedProps.backgroundColor = value;
      if (setter === setRadius) updatedProps.radius = parseInt(value, 10);
      if (setter === setPressedColor) updatedProps.pressedColor = value;
      onUpdateComponentProps(selectedComponent.id, updatedProps);
    }
  };
  return (
    <aside id="right-panel" className="w-64 bg-gray-200 p-4 overflow-auto">
      <h2 className="text-lg font-bold mb-2">Screen Properties</h2>
      <div className="mb-4">
        <label
          htmlFor="centerPanelBackgroundColor"
          className="block text-sm font-medium text-gray-700">
          Background Color
        </label>
        <input
          type="color"
          id="centerPanelBackgroundColor"
          value={centerPanelBackgroundColor}
          onChange={(e) => onUpdateCenterPanelBackgroundColor(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {selectedComponent && (
        <>
          <h2 className="text-lg font-bold mb-2 mt-4">Component Properties</h2>

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
              onChange={(e) => handleInputChange(setX, e.target.value)}
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
              onChange={(e) => handleInputChange(setY, e.target.value)}
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
              onChange={(e) => handleInputChange(setWidth, e.target.value)}
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
              onChange={(e) => handleInputChange(setHeight, e.target.value)}
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
              Radius
            </label>
            <input
              type="number"
              id="radius"
              value={radius}
              onChange={(e) => handleInputChange(setRadius, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {/* Conditional Pressed Color (Only for Buttons) */}
          {selectedComponent && selectedComponent.type === "KivyButton" && (
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
          )}
        </>
      )}
    </aside>
  );
};

export default RightPanel;
