import { Rnd } from "react-rnd";
import { useState } from "react";
import { IconContext } from "react-icons";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Widget = ({
    id,
    componentType,
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
    zoomLevel = 1,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const actualPosition = { x: x, y: y };
    const actualSize = { width: width, height: height };

    let zIndex = 1;
    if (componentType !== "PySideFrame") zIndex = 10;

    return (
        <Rnd
            position={actualPosition}
            size={actualSize}
            scale={zoomLevel}
            style={{
                border: isSelected
                    ? `2px solid blue`
                    : isHovered
                      ? `1px dashed gray`
                      : "none",
                position: "absolute",
                boxSizing: "border-box",
                zIndex,
            }}
            bounds="parent"
            data-id={id}
            enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
            }}
            onDragStart={(e) => {
                e.stopPropagation();
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                e.stopPropagation();
                const finalDimensions = {
                    width: Math.round(ref.offsetWidth / zoomLevel),
                    height: Math.round(ref.offsetHeight / zoomLevel),
                    x: Math.round(position.x),
                    y: Math.round(position.y),
                };
                onResize(id, finalDimensions);
            }}
            onDragStop={(e, d) => {
                e.stopPropagation();
                onMove(id, {
                    relativePos: {
                        x: Math.round(d.x),
                        y: Math.round(d.y),
                    },
                    mouseEventCoords: {
                        clientX: e.clientX,
                        clientY: e.clientY,
                    },
                });
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div
                className="relative w-full h-full"
                style={{ pointerEvents: "none" }}>
                <div
                    className="absolute inset-0"
                    style={{ pointerEvents: "auto" }}>
                    {children}
                </div>

                {(isHovered || isSelected) && (
                    <div
                        className="absolute -top-3 -right-3 flex gap-1"
                        style={{ pointerEvents: "auto", zIndex: 10 }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate();
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition"
                            style={{
                                minWidth: "20px",
                                touchAction: "manipulation",
                            }}
                            title="Duplicate">
                            <IconContext.Provider value={{ size: "0.7em" }}>
                                <FaCopy />
                            </IconContext.Provider>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(id);
                            }}
                            className="bg-red-500 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition"
                            style={{
                                minWidth: "20px",
                                touchAction: "manipulation",
                            }}
                            title="Delete">
                            <IconContext.Provider value={{ size: "0.8em" }}>
                                <IoMdClose />
                            </IconContext.Provider>
                        </button>
                    </div>
                )}
            </div>
        </Rnd>
    );
};

export default Widget;
