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
            onDuplicateComponent,
            onResizeComponent,
            onMoveComponent,
            onSelectComponent,
            selectedComponentId,
            backgroundColor,
            screenWidth = 1280,
            screenHeight = 800,
        },
        ref
    ) => {
        return (
            <main
                ref={ref}
                className="flex-1 p-4 overflow-auto relative"
                style={{
                    backgroundColor: backgroundColor,
                    minWidth: 0,
                }}>
                <div
                    className="relative mx-auto"
                    style={{
                        width: `${screenWidth}px`,
                        height: `${screenHeight}px`,
                        backgroundColor: backgroundColor,
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                        overflow: "hidden",
                        // Remove maxWidth: "100%" to allow horizontal scrolling
                    }}>
                    {components.map((component) => (
                        <Widget
                            key={component.id}
                            id={component.id}
                            x={component.x}
                            y={component.y}
                            width={component.width}
                            height={component.height}
                            onDelete={onDeleteComponent}
                            onDuplicate={onDuplicateComponent}
                            onResize={onResizeComponent}
                            onMove={onMoveComponent}
                            onSelect={onSelectComponent}
                            isSelected={component.id === selectedComponentId}>
                            {/* Component rendering content remains unchanged */}
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
                </div>
            </main>
        );
    }
);

CenterPanel.displayName = "CenterPanel";

export default CenterPanel;
