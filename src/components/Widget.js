import { Rnd } from "react-rnd";
import { useState } from "react";
import { IconContext } from "react-icons";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

// Add zoomLevel to the component props
const Widget = ({
    id,
    onDelete,
    onDuplicate,
    x,
    y,
    width,
    height,
    children,
    onResize,
    onMove,
    onSelect,
    isSelected,
    zoomLevel = 1, // Default to 1 if not provided
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tempDimensions, setTempDimensions] = useState({
        width,
        height,
        x,
        y,
    });

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
            scale={zoomLevel} // Add scale for correct drag handling
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
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    x: position.x,
                    y: position.y,
                };
                setTempDimensions(newDimensions);
                // Pass temporary dimensions to parent for live updates
                onResize(id, newDimensions, true); // true indicates it's a temporary update
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                const finalDimensions = {
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    x: position.x,
                    y: position.y,
                };
                // Final update when resize stops
                onResize(id, finalDimensions);
            }}
            onDragStop={(e, d) => {
                onMove(id, {
                    x: d.x,
                    y: d.y,
                });
            }}
            onClick={() => onSelect(id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div className="relative w-full h-full ">
                {(isHovered || isSelected) && (
                    <>
                        {/* Duplicate button */}
                        <button
                            onClick={() => onDuplicate()}
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
                            onClick={() => onDelete(id)}
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
