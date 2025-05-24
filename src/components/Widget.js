import { Rnd } from "react-rnd";
import { useState } from "react";
import PropTypes from "prop-types";
import { IconContext } from "react-icons";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useAppStore } from "../store/rootStore";

const WidgetToolbar = ({ id, onDuplicate, onDelete }) => (
    <div
        className="absolute -top-7 -right-3 flex gap-1"
        style={{ pointerEvents: "auto", zIndex: 10 }}>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition"
            style={{ minWidth: 20, touchAction: "manipulation" }}
            title="Duplicate">
            <IconContext.Provider value={{ size: "0.8em" }}>
                <FaCopy />
            </IconContext.Provider>
        </button>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
            }}
            className="bg-red-500 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition"
            style={{ minWidth: 20, touchAction: "manipulation" }}
            title="Delete">
            <IconContext.Provider value={{ size: "0.9em" }}>
                <IoMdClose />
            </IconContext.Provider>
        </button>
    </div>
);

WidgetToolbar.propTypes = {
    id: PropTypes.number.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

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
    isDropTarget = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const updateDropTargetFrameId = useAppStore(
        (s) => s.updateDropTargetFrameId
    );
    const screens = useAppStore((s) => s.screens);
    const currentScreenIndex = useAppStore((s) => s.currentScreenIndex);
    const zoomLevelStore = useAppStore((s) => s.zoomLevel);
    const panPosition = useAppStore((s) => s.panPosition);

    const actualPosition = { x, y };
    const actualSize = { width, height };
    let zIndex = componentType !== "PySideFrame" ? 10 : 1;

    const getFrameUnderMouse = (clientX, clientY) => {
        const screen = screens[currentScreenIndex];
        if (!screen) return null;
        const allComponents = screen.components;
        const _getAbsolutePosition =
            useAppStore.getState()._getAbsolutePosition;
        const frames = allComponents.filter(
            (c) => c.type === "PySideFrame" && c.id !== id
        );
        const screenContainerRect = document
            .querySelector(".relative.mx-auto.origin-top-left")
            ?.getBoundingClientRect();
        if (!screenContainerRect) return null;

        // mouseXInViewportOfScreen / mouseYInViewportOfScreen are mouse coordinates
        // relative to the screen's transformed top-left corner, in scaled viewport pixels.
        const mouseXInViewportOfScreen = clientX - screenContainerRect.left;
        const mouseYInViewportOfScreen = clientY - screenContainerRect.top;

        // To get coordinates in the screen's own unscaled system, divide by zoomLevelStore.
        // zoomLevelStore is the zoom level from the app store.
        const unscaledMouseX = mouseXInViewportOfScreen / zoomLevelStore;
        const unscaledMouseY = mouseYInViewportOfScreen / zoomLevelStore;

        let potentialParentFrameId = null;
        for (const frame of frames) {
            const frameAbsPos = _getAbsolutePosition(frame.id, allComponents); // These are unscaled
            if (
                unscaledMouseX >= frameAbsPos.x &&
                unscaledMouseX <= frameAbsPos.x + frame.width &&
                unscaledMouseY >= frameAbsPos.y &&
                unscaledMouseY <= frameAbsPos.y + frame.height
            ) {
                potentialParentFrameId = frame.id;
                break;
            }
        }

        if (potentialParentFrameId !== null) {
            return potentialParentFrameId;
        }

        // If not over any frame, check if inside the main screen area
        if (
            unscaledMouseX >= 0 &&
            unscaledMouseX <= screen.width && // screen.width is unscaled
            unscaledMouseY >= 0 &&
            unscaledMouseY <= screen.height // screen.height is unscaled
        ) {
            return -1; // Special ID indicating the main screen
        }
        return null; // Not over any valid drop target
    };

    return (
        <Rnd
            position={actualPosition}
            size={actualSize}
            scale={zoomLevel}
            className={`absolute ${
                isSelected
                    ? "border-2 border-blue-500 rounded-md shadow-lg"
                    : isHovered
                      ? "border border-solid border-slate-400 dark:border-slate-600 rounded-md"
                      : "border border-transparent rounded-md"
            }`}
            style={{
                zIndex,
            }}
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
                    width: Math.round(ref.offsetWidth),
                    height: Math.round(ref.offsetHeight),
                    x: Math.round(position.x),
                    y: Math.round(position.y),
                };
                onResize(id, finalDimensions);
            }}
            onDrag={(e, d) => {
                const frameId = getFrameUnderMouse(e.clientX, e.clientY);
                const screen = screens[currentScreenIndex];
                const allComponents = screen.components;
                const thisComponent = allComponents.find((c) => c.id === id);
                if (!thisComponent) return;
                const currentParentId = thisComponent.parentId ?? null;
                const wouldBeParentId = frameId === -1 ? null : frameId;

                if (wouldBeParentId !== currentParentId) {
                    updateDropTargetFrameId(frameId);
                } else {
                    updateDropTargetFrameId(null);
                }
            }}
            onDragStop={(e, d) => {
                e.stopPropagation();
                updateDropTargetFrameId(null);
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
            <div className="relative w-full h-full pointer-events-none ">
                {isDropTarget && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-sky-600 bg-sky-500/40 animate-[blink-overlay_1.5s_linear_infinite] rounded-md z-100" />
                )}
                <div className="absolute inset-0 pointer-events-auto">
                    {children}
                </div>
                {(isHovered || isSelected) && (
                    <WidgetToolbar
                        id={id}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                    />
                )}
            </div>
        </Rnd>
    );
};

Widget.propTypes = {
    id: PropTypes.number.isRequired,
    componentType: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    children: PropTypes.node,
    onResize: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    zoomLevel: PropTypes.number,
    isDropTarget: PropTypes.bool,
};

if (
    typeof window !== "undefined" &&
    !document.getElementById("widget-blink-overlay-style")
) {
    const style = document.createElement("style");
    style.id = "widget-blink-overlay-style";
    style.innerHTML = `
    @keyframes blink-overlay {
        0% { opacity: 1; }
        50% { opacity: 0.4; }
        100% { opacity: 1; }
    }
    `;
    document.head.appendChild(style);
}

export default Widget;
