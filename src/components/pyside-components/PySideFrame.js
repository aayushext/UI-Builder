import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Convert hex color to RGB object.
 * @param {string} hex
 * @returns {{r: number, g: number, b: number}|null}
 */
const hexToRgb = (hex) => {
    if (!hex) return null;
    hex = hex.replace("#", "");
    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6 || hex.length === 8) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        return null;
    }
    return { r, g, b };
};

/**
 * Convert RGB object to hex color string.
 * @param {{r: number, g: number, b: number}} rgb
 * @returns {string}
 */
const rgbToHex = ({ r, g, b }) =>
    "#" +
    [r, g, b]
        .map((c) => {
            const hex = Math.round(c).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        })
        .join("");

/**
 * Adjust color brightness by a percentage.
 * @param {string} hex
 * @param {number} percent
 * @returns {string}
 */
const adjustColor = (hex, percent) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const factor = 1 + percent / 100;
    return rgbToHex({
        r: Math.max(0, Math.min(255, rgb.r * factor)),
        g: Math.max(0, Math.min(255, rgb.g * factor)),
        b: Math.max(0, Math.min(255, rgb.b * factor)),
    });
};

const lightenColor = (hex, percent) => adjustColor(hex, Math.abs(percent));
const darkenColor = (hex, percent) => adjustColor(hex, -Math.abs(percent));

/**
 * Draw a raised or sunken frame on canvas.
 */
const drawRaisedFrame = (
    ctx,
    width,
    height,
    lineW,
    midLineW,
    frameShape,
    colorLight,
    colorDark
) => {
    if (frameShape !== "HLine" && frameShape !== "VLine") {
        // Top Left Outside
        ctx.fillStyle = colorLight;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width - lineW, lineW);
        ctx.lineTo(lineW, lineW);
        ctx.lineTo(lineW, height - lineW);
        ctx.closePath();
        ctx.fill();

        if (frameShape === "Box") {
            // Bottom Right Inside
            ctx.fillStyle = colorLight;
            ctx.beginPath();
            ctx.moveTo(lineW + midLineW, height - lineW - midLineW);
            ctx.lineTo(width - lineW - midLineW, height - lineW - midLineW);
            ctx.lineTo(width - lineW - midLineW, lineW + midLineW);
            ctx.lineTo(width - lineW * 2 - midLineW, lineW * 2 + midLineW);
            ctx.lineTo(
                width - lineW * 2 - midLineW,
                height - lineW * 2 - midLineW
            );
            ctx.lineTo(lineW * 2 + midLineW, height - lineW * 2 - midLineW);
            ctx.closePath();
            ctx.fill();
        }

        // Bottom Right Outside
        ctx.fillStyle = colorDark;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height);
        ctx.lineTo(width, 0);
        ctx.lineTo(width - lineW, lineW);
        ctx.lineTo(width - lineW, height - lineW);
        ctx.lineTo(lineW, height - lineW);
        ctx.closePath();
        ctx.fill();

        if (frameShape === "Box") {
            // Top Left Inside
            ctx.fillStyle = colorDark;
            ctx.beginPath();
            ctx.moveTo(lineW + midLineW, height - lineW - midLineW);
            ctx.lineTo(lineW + midLineW, lineW + midLineW);
            ctx.lineTo(width - lineW - midLineW, lineW + midLineW);
            ctx.lineTo(width - lineW * 2 - midLineW, lineW * 2 + midLineW);
            ctx.lineTo(lineW * 2 + midLineW, lineW * 2 + midLineW);
            ctx.lineTo(lineW * 2 + midLineW, height - lineW * 2 - midLineW);
            ctx.closePath();
            ctx.fill();
        }
    } else if (frameShape === "HLine") {
        ctx.fillStyle = colorLight;
        ctx.beginPath();
        ctx.moveTo(0, height / 2 - lineW - midLineW);
        ctx.lineTo(width, height / 2 - lineW - midLineW);
        ctx.lineTo(width - lineW, height / 2 - midLineW);
        ctx.lineTo(lineW, height / 2 - midLineW);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, height / 2 - lineW - midLineW);
        ctx.lineTo(lineW, height / 2 - midLineW);
        ctx.lineTo(lineW, height / 2 + midLineW);
        ctx.lineTo(0, height / 2 + lineW + midLineW);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = colorDark;
        ctx.beginPath();
        ctx.moveTo(0, height / 2 + lineW + midLineW);
        ctx.lineTo(width, height / 2 + lineW + midLineW);
        ctx.lineTo(width - lineW, height / 2 + midLineW);
        ctx.lineTo(lineW, height / 2 + midLineW);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width, height / 2 - lineW - midLineW);
        ctx.lineTo(width - lineW, height / 2 - midLineW);
        ctx.lineTo(width - lineW, height / 2 + midLineW);
        ctx.lineTo(width, height / 2 + lineW + midLineW);
        ctx.closePath();
        ctx.fill();
    } else if (frameShape === "VLine") {
        ctx.fillStyle = colorLight;
        ctx.beginPath();
        ctx.moveTo(width / 2 - lineW - midLineW, 0);
        ctx.lineTo(width / 2 - lineW - midLineW, height);
        ctx.lineTo(width / 2 - midLineW, height - lineW);
        ctx.lineTo(width / 2 - midLineW, lineW);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width / 2 - lineW - midLineW, 0);
        ctx.lineTo(width / 2 - midLineW, lineW);
        ctx.lineTo(width / 2 + midLineW, lineW);
        ctx.lineTo(width / 2 + lineW + midLineW, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = colorDark;
        ctx.beginPath();
        ctx.moveTo(width / 2 + lineW + midLineW, 0);
        ctx.lineTo(width / 2 + lineW + midLineW, height);
        ctx.lineTo(width / 2 + midLineW, height - lineW);
        ctx.lineTo(width / 2 + midLineW, lineW);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width / 2 - lineW - midLineW, height);
        ctx.lineTo(width / 2 - midLineW, height - lineW);
        ctx.lineTo(width / 2 + midLineW, height - lineW);
        ctx.lineTo(width / 2 + lineW + midLineW, height);
        ctx.closePath();
        ctx.fill();
    }
};

/**
 * Canvas for drawing groove/raised/sunken/plain frames.
 */
const BoxFrameCanvas = ({
    width,
    height,
    lineW,
    midLineW,
    frameShape,
    frameShadow,
    backgroundColor,
    mainBackgroundColor,
}) => {
    const canvasRef = useRef(null);
    // Add mainBackgroundColor to prev.current and useEffect dependency array
    const prev = useRef({
        width: 0,
        height: 0,
        lineW: 0,
        midLineW: 0,
        frameShape: "",
        frameShadow: "",
        backgroundColor: "",
        mainBackgroundColor: "",
    });

    useEffect(() => {
        if (
            prev.current.width === width &&
            prev.current.height === height &&
            prev.current.lineW === lineW &&
            prev.current.midLineW === midLineW &&
            prev.current.frameShape === frameShape &&
            prev.current.frameShadow === frameShadow &&
            prev.current.backgroundColor === backgroundColor &&
            prev.current.mainBackgroundColor === mainBackgroundColor
        ) {
            return;
        }
        prev.current = {
            width,
            height,
            lineW,
            midLineW,
            frameShape,
            frameShadow,
            backgroundColor,
            mainBackgroundColor, // Added
        };

        if (!width || !height) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        const baseColor = backgroundColor || "#e0e0e0";
        // Fill the frame's background first
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        ctx.save(); // Save context state

        // Colors for raised/sunken effects
        const colorBaseLight = lightenColor(baseColor, 30);
        const colorBaseDark = darkenColor(baseColor, 30);
        const colorDarkest = darkenColor(baseColor, 60); // Always use for mid-line

        // Colors for plain borders (derived based on frameShape for Plain shadow)
        let plainBorderColor = colorDarkest;
        if (frameShadow === "Plain") {
            if (frameShape === "StyledPanel") {
                plainBorderColor = darkenColor(baseColor, 15); // like colorMidDark
            } else if (frameShape === "Panel" || frameShape === "WinPanel") {
                // For plain Panel/WinPanel, Qt often uses a color similar to colorMid
                // colorMid was darkenColor(baseColor, 60), so default plainBorderColor is fine.
            }
        }

        if (frameShadow === "Raised") {
            drawRaisedFrame(
                ctx,
                width,
                height,
                lineW,
                midLineW,
                frameShape,
                colorBaseLight,
                colorBaseDark
            );
            // Draw mid-line for Raised using the darkest color
            if (
                (frameShape === "Box" ||
                    frameShape === "Panel" ||
                    frameShape === "WinPanel" ||
                    frameShape === "StyledPanel") &&
                midLineW > 0
            ) {
                ctx.strokeStyle = colorDarkest;
                ctx.lineWidth = midLineW;
                ctx.strokeRect(
                    lineW + midLineW / 2,
                    lineW + midLineW / 2,
                    Math.max(0, width - lineW * 2 - midLineW),
                    Math.max(0, height - lineW * 2 - midLineW)
                );
            }
        } else if (frameShadow === "Sunken") {
            drawRaisedFrame(
                ctx,
                width,
                height,
                lineW,
                midLineW,
                frameShape,
                colorBaseDark,
                colorBaseLight
            );
            // Draw mid-line for Sunken using the darkest color
            if (
                (frameShape === "Box" ||
                    frameShape === "Panel" ||
                    frameShape === "WinPanel" ||
                    frameShape === "StyledPanel") &&
                midLineW > 0
            ) {
                ctx.strokeStyle = colorDarkest;
                ctx.lineWidth = midLineW;
                ctx.strokeRect(
                    lineW + midLineW / 2,
                    lineW + midLineW / 2,
                    Math.max(0, width - lineW * 2 - midLineW),
                    Math.max(0, height - lineW * 2 - midLineW)
                );
            }
        } else if (frameShadow === "Plain") {
            if (frameShape === "HLine" || frameShape === "VLine") {
                // Draw plain lines
                if (lineW > 0) {
                    ctx.fillStyle = plainBorderColor;
                    if (frameShape === "HLine") {
                        // Top and bottom parts of the "groove"
                        ctx.fillRect(
                            0,
                            height / 2 - lineW / 2 - midLineW / 2,
                            width,
                            lineW
                        );
                        // If midLineW is 0, this makes a single line of lineW thickness
                        // If midLineW > 0, these are the outer parts of the groove
                        if (midLineW > 0) {
                            ctx.fillRect(
                                0,
                                height / 2 - lineW / 2 - midLineW / 2,
                                width,
                                lineW
                            ); // Top edge
                            ctx.fillRect(
                                0,
                                height / 2 + midLineW / 2 - lineW / 2,
                                width,
                                lineW
                            ); // Bottom edge
                        } else {
                            ctx.fillRect(0, (height - lineW) / 2, width, lineW); // Single centered line
                        }
                    } else {
                        // VLine
                        if (midLineW > 0) {
                            ctx.fillRect(
                                width / 2 - lineW / 2 - midLineW / 2,
                                0,
                                lineW,
                                height
                            ); // Left edge
                            ctx.fillRect(
                                width / 2 + midLineW / 2 - lineW / 2,
                                0,
                                lineW,
                                height
                            ); // Right edge
                        } else {
                            ctx.fillRect((width - lineW) / 2, 0, lineW, height); // Single centered line
                        }
                    }
                }
                if (midLineW > 0) {
                    ctx.fillStyle = mainBackgroundColor || "rgba(0,0,0,0)"; // Middle part, transparent to parent
                    if (frameShape === "HLine") {
                        ctx.fillRect(
                            lineW > 0 ? lineW : 0,
                            height / 2 - midLineW / 2,
                            width - (lineW > 0 ? 2 * lineW : 0),
                            midLineW
                        );
                    } else {
                        // VLine
                        ctx.fillRect(
                            width / 2 - midLineW / 2,
                            lineW > 0 ? lineW : 0,
                            midLineW,
                            height - (lineW > 0 ? 2 * lineW : 0)
                        );
                    }
                }
            } else {
                // Box, Panel, StyledPanel, WinPanel with Plain shadow
                const totalBorderWidth = lineW + midLineW;
                if (totalBorderWidth > 0) {
                    if (lineW > 0) {
                        ctx.strokeStyle = plainBorderColor;
                        ctx.lineWidth = lineW;
                        ctx.strokeRect(
                            lineW / 2,
                            lineW / 2,
                            Math.max(0, width - lineW),
                            Math.max(0, height - lineW)
                        );
                    }
                    if (midLineW > 0) {
                        // For plain shadow, midLineWidth usually just makes the border thicker or is an inner line of same color
                        ctx.strokeStyle = colorDarkest; // Always use darkest for mid-line
                        ctx.lineWidth = midLineW;
                        ctx.strokeRect(
                            lineW + midLineW / 2,
                            lineW + midLineW / 2,
                            Math.max(0, width - lineW * 2 - midLineW),
                            Math.max(0, height - lineW * 2 - midLineW)
                        );
                    }
                }
            }
        }
        // Note: The old 'else if (frameShape !== "HLine" && frameShape !== "VLine")' and its midLineWidth part
        // for non-Raised/Sunken are now handled by the frameShadow === "Plain" block.

        ctx.restore(); // Restore context state
    }, [
        width,
        height,
        lineW,
        midLineW,
        frameShape,
        frameShadow,
        backgroundColor,
        mainBackgroundColor, // Added to dependency array
    ]);

    if (!width || !height) return null;

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 2,
                display: "block",
            }}
        />
    );
};
BoxFrameCanvas.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    lineW: PropTypes.number,
    midLineW: PropTypes.number,
    frameShape: PropTypes.string,
    frameShadow: PropTypes.string,
    backgroundColor: PropTypes.string,
    mainBackgroundColor: PropTypes.string,
};

/**
 * PySideFrame - Professional, flexible frame component.
 */
const PySideFrame = ({
    backgroundColor,
    frameShape,
    frameShadow,
    lineWidth,
    midLineWidth,
    borderColor, // For custom border
    borderWidth, // For custom border
    useCustomBorder,
    width,
    height,
    children,
    mainBackgroundColor, // Pass this down to BoxFrameCanvas
}) => {
    const lineW = lineWidth !== undefined ? Math.max(0, lineWidth) : 1;
    const midLineW = midLineWidth !== undefined ? Math.max(0, midLineWidth) : 0;
    const totalWidth = lineW + midLineW;

    // Base style for the outermost div of PySideFrame
    const componentRootStyle = {
        backgroundColor:
            frameShape === "HLine" || frameShape === "VLine"
                ? "transparent"
                : backgroundColor,
        boxSizing: "border-box",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
    };

    if (useCustomBorder) {
        const customBorderStyle = {
            ...componentRootStyle, // Use componentRootStyle which has the correct bg
            border: `${borderWidth}px solid ${borderColor}`,
        };
        return (
            <div className="w-full h-full relative" style={customBorderStyle}>
                {children}
            </div>
        );
    }

    if (frameShape === "NoFrame") {
        return (
            <div className="w-full h-full relative" style={componentRootStyle}>
                {children}
            </div>
        );
    }

    // Condition for container shapes that need their children inset by the border width
    const isContainerShape =
        frameShape === "Box" ||
        frameShape === "Panel" ||
        frameShape === "WinPanel" ||
        frameShape === "StyledPanel";
    // Calculate inset for children container. Only apply if it's a container shape and has a border.
    const insetAmount = isContainerShape && totalWidth > 0 ? totalWidth : 0;

    // For all other frame styles that require drawing (Box, Panel, HLine, VLine, etc.)
    // use BoxFrameCanvas.
    return (
        <div
            className="w-full h-full relative motion-scale-in-[1.5] motion-opacity-in-[0%] motion-duration-[250ms] motion-ease-spring-bouncier"
            style={componentRootStyle}>
            <BoxFrameCanvas
                width={width}
                height={height}
                lineW={lineW}
                midLineW={midLineW}
                frameShape={frameShape}
                frameShadow={frameShadow}
                backgroundColor={backgroundColor}
                mainBackgroundColor={mainBackgroundColor}
            />
            <div
                style={{
                    zIndex: 3,
                    overflow: "hidden",
                }}>
                {children}
            </div>
        </div>
    );
};

PySideFrame.propTypes = {
    backgroundColor: PropTypes.string,
    frameShape: PropTypes.string,
    frameShadow: PropTypes.string,
    lineWidth: PropTypes.number,
    midLineWidth: PropTypes.number,
    borderColor: PropTypes.string,
    borderWidth: PropTypes.number,
    useCustomBorder: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    children: PropTypes.node,
    mainBackgroundColor: PropTypes.string,
};

export default PySideFrame;
