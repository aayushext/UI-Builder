import React from "react";
import Widget from "./Widget";
import PySideButton from "@/components/pyside-components/PySideButton";
import PySideLabel from "@/components/pyside-components/PySideLabel";

const CenterPanel = React.forwardRef(
  (
    {
      components,
      onDeleteComponent,
      onResizeComponent,
      onMoveComponent,
      onSelectComponent,
      selectedComponentId,
      backgroundColor,
    },
    ref
  ) => {
    return (
      <main
        ref={ref}
        className="flex-1 p-4 overflow-auto relative"
        style={{ backgroundColor: backgroundColor }}>
        <h1 className="text-2xl font-bold mb-4">Main Content</h1>
        {components.map((component) => (
          <Widget
            key={component.id}
            id={component.id}
            x={component.x}
            y={component.y}
            width={component.width}
            height={component.height}
            onDelete={onDeleteComponent}
            onResize={onResizeComponent}
            onMove={onMoveComponent}
            onSelect={onSelectComponent}
            isSelected={component.id === selectedComponentId}>
            {component.type === "PySideButton" && (
              <PySideButton
                text={component.text}
                fontSize={component.fontSize}
                textColor={component.textColor}
                backgroundColor={component.backgroundColor}
                radius={component.radius}
                pressedColor={component.pressedColor}
                hoverColor={component.hoverColor}
              />
            )}
            {component.type === "PySideLabel" && (
              <PySideLabel
                text={component.text}
                fontSize={component.fontSize}
                textColor={component.textColor}
                backgroundColor={component.backgroundColor}
                radius={component.radius}
              />
            )}
          </Widget>
        ))}
      </main>
    );
  }
);

CenterPanel.displayName = "CenterPanel";

export default CenterPanel;
