import React from "react";
import Widget from "./Widget";
import PySideButton from "@/components/pyside-components/PySideButton";
import PySideLabel from "@/components/pyside-components/PySideLabel";
import PySideSlider from "@/components/pyside-components/PySideSlider";

const CenterPanel = React.forwardRef(
    (
        {
            components,
            onDeleteComponent,
            onDuplicateComponent, // Add this prop
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
                {components.map((component) => (
                    <Widget
                        key={component.id}
                        id={component.id}
                        x={component.x}
                        y={component.y}
                        width={component.width}
                        height={component.height}
                        onDelete={onDeleteComponent}
                        onDuplicate={onDuplicateComponent} // Pass duplicate function
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
                        {component.type === "PySideSlider" && (
                            <PySideSlider
                                width={component.width}
                                height={component.height}
                                minimum={component.minimum}
                                maximum={component.maximum}
                                value={component.value}
                                orientation={component.orientation}
                                sliderColor={component.sliderColor}
                                backgroundColor={component.backgroundColor}
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
