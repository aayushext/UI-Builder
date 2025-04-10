import { Rnd } from "react-rnd";
import { useState } from "react";
import { IconContext } from "react-icons";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useScreenStore } from "@/store/ScreenStore";
import { useComponentStore } from "@/store/ComponentStore";

// Widget now only needs id as a prop
const Widget = ({ id, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tempDimensions, setTempDimensions] = useState({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    });

    // Get component-specific data and actions from stores
    const {
        deleteComponent,
        duplicateComponent,
        resizeComponent,
        moveComponent,
        selectComponent,
        selectedComponentId,
    } = useComponentStore();

    const { zoomLevel } = useScreenStore();

    // Get the component data from the current screen
    const currentComponent = useComponentStore()
        .getCurrentScreenComponents()
        .find((component) => component.id === id);

    // If component not found, return null
    if (!currentComponent) return null;

    const { x, y, width, height } = currentComponent;
    const isSelected = id === selectedComponentId;

    // Calculate actual position based on zoom level
    const actualPosition = { x: x, y: y };
    const actualSize = { width: width, height: height };

    return (
        <Rnd
            default={{
                x: x,
                y: y,
                width: width,
                height: height,
            }}
            position={actualPosition}
            size={actualSize}
            scale={zoomLevel}
            style={{
                border: isSelected ? "2px solid blue" : "0px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            bounds="parent"
            data-id={id}
            onResize={(e, direction, ref, delta, position) => {
                // Update dimensions during resize
                const newDimensions = {
                    width: Math.round(ref.offsetWidth * 100) / 100,
                    height: Math.round(ref.offsetHeight * 100) / 100,
                    x: Math.round(position.x * 100) / 100,
                    y: Math.round(position.y * 100) / 100,
                };
                setTempDimensions(newDimensions);
                // Pass temporary dimensions to parent for live updates
                resizeComponent(id, newDimensions, true); // true indicates it's a temporary update
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const finalDimensions = {
                    width: Math.round(ref.offsetWidth * 100) / 100,
                    height: Math.round(ref.offsetHeight * 100) / 100,
                    x: Math.round(position.x * 100) / 100,
                    y: Math.round(position.y * 100) / 100,
                };
                // Final update when resize stops
                resizeComponent(id, finalDimensions);
            }}
            onDragStop={(e, d) => {
                moveComponent(id, {
                    x: Math.round(d.x * 100) / 100,
                    y: Math.round(d.y * 100) / 100,
                });
            }}
            onClick={() => selectComponent(id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div className="relative w-full h-full ">
                {(isHovered || isSelected) && (
                    <>
                        {/* Duplicate button */}
                        <button
                            onClick={() => duplicateComponent()}
                            className="absolute -top-4 right-1 bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded-full text-xs -mt-3 -ml-3 w-6 h-6 flex items-center justify-center shadow-sm transition"
                            style={{
                                minWidth: "24px",
                                touchAction: "manipulation",
                            }}>
                            <IconContext.Provider value={{ size: "1em" }}>
                                <div>
                                    <FaCopy />
                                </div>
                            </IconContext.Provider>
                        </button>

                        {/* Delete button */}
                        <button
                            onClick={() => deleteComponent(id)}
                            className="absolute -top-4 -right-3 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded-full -mt-3 -mr-3 w-6 h-6 flex items-center justify-center shadow-sm transition"
                            style={{
                                minWidth: "24px",
                                touchAction: "manipulation",
                            }}>
                            <IconContext.Provider value={{ size: "1em" }}>
                                <div>
                                    <IoMdClose />
                                </div>
                            </IconContext.Provider>
                        </button>
                    </>
                )}
                {children}
            </div>
        </Rnd>
    );
};

export default Widget;
