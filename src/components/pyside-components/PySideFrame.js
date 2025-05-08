import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Converts a hex color string to an RGB object.
 * @param {string} hex - The hex color string.
 * @returns {{r: number, g: number, b: number}|null} The RGB object or null if invalid.
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
 * Converts an RGB object to a hex color string.
 * @param {{r: number, g: number, b: number}} rgb - The RGB object.
 * @returns {string} The hex color string.
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
 * Adjusts color brightness by a percentage.
 * @param {string} hex - The hex color string.
 * @param {number} percent - The percentage to adjust.
 * @returns {string} The adjusted hex color string.
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

/**
 * Lightens a color by a percentage.
 * @param {string} hex - The hex color string.
 * @param {number} percent - The percentage to lighten.
 * @returns {string} The lightened hex color string.
 */
const lightenColor = (hex, percent) => adjustColor(hex, Math.abs(percent));

/**
 * Darkens a color by a percentage.
 * @param {string} hex - The hex color string.
 * @param {number} percent - The percentage to darken.
 * @returns {string} The darkened hex color string.
 */
const darkenColor = (hex, percent) => adjustColor(hex, -Math.abs(percent));

/**
 * Draws a raised or sunken frame on a canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas context.
 * @param {number} width - The width of the frame.
 * @param {number} height - The height of the frame.
 * @param {number} lineW - The border line width.
 * @param {number} midLineW - The mid-line width.
 * @param {string} frameShape - The shape of the frame.
 * @param {string} colorLight - The light color.
 * @param {string} colorDark - The dark color.
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
 * Renders a canvas for drawing groove/raised/sunken/plain frames.
 * @param {object} props - The component props.
 * @returns {JSX.Element|null} The rendered canvas or null.
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
            mainBackgroundColor,
        };

        if (!width || !height) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        const baseColor = backgroundColor || "#e0e0e0";
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        ctx.save();

        const colorBaseLight = lightenColor(baseColor, 30);
        const colorBaseDark = darkenColor(baseColor, 30);
        const colorDarkest = darkenColor(baseColor, 60);

        let plainBorderColor = colorDarkest;
        if (frameShadow === "Plain") {
            if (frameShape === "StyledPanel") {
                plainBorderColor = darkenColor(baseColor, 15);
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
                if (lineW > 0) {
                    ctx.fillStyle = plainBorderColor;
                    if (midLineW > 0) {
                        // Draw both edges for groove effect
                        if (frameShape === "HLine") {
                            ctx.fillRect(
                                0,
                                height / 2 - lineW / 2 - midLineW / 2,
                                width,
                                lineW
                            );
                            ctx.fillRect(
                                0,
                                height / 2 + midLineW / 2 - lineW / 2,
                                width,
                                lineW
                            );
                        } else {
                            ctx.fillRect(
                                width / 2 - lineW / 2 - midLineW / 2,
                                0,
                                lineW,
                                height
                            );
                            ctx.fillRect(
                                width / 2 + midLineW / 2 - lineW / 2,
                                0,
                                lineW,
                                height
                            );
                        }
                    } else {
                        // Single centered line
                        if (frameShape === "HLine") {
                            ctx.fillRect(0, (height - lineW) / 2, width, lineW);
                        } else {
                            ctx.fillRect((width - lineW) / 2, 0, lineW, height);
                        }
                    }
                }
                if (midLineW > 0) {
                    ctx.fillStyle = mainBackgroundColor || "rgba(0,0,0,0)";
                    if (frameShape === "HLine") {
                        ctx.fillRect(
                            lineW > 0 ? lineW : 0,
                            height / 2 - midLineW / 2,
                            width - (lineW > 0 ? 2 * lineW : 0),
                            midLineW
                        );
                    } else {
                        ctx.fillRect(
                            width / 2 - midLineW / 2,
                            lineW > 0 ? lineW : 0,
                            midLineW,
                            height - (lineW > 0 ? 2 * lineW : 0)
                        );
                    }
                }
            } else {
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
                        ctx.strokeStyle = colorDarkest;
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
        ctx.restore();
    }, [
        width,
        height,
        lineW,
        midLineW,
        frameShape,
        frameShadow,
        backgroundColor,
        mainBackgroundColor,
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
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered frame.
 */
const PySideFrame = ({
    backgroundColor,
    frameShape,
    frameShadow,
    lineWidth,
    midLineWidth,
    borderColor,
    borderWidth,
    useCustomBorder,
    width,
    height,
    children,
    mainBackgroundColor,
}) => {
    const lineW = lineWidth !== undefined ? Math.max(0, lineWidth) : 1;
    const midLineW = midLineWidth !== undefined ? Math.max(0, midLineWidth) : 0;

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
        return (
            <div
                className="w-full h-full relative overflow-visible"
                style={componentRootStyle}>
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        border: `${borderWidth}px solid ${borderColor}`,
                        borderRadius: componentRootStyle.borderRadius,
                        boxSizing: "border-box",
                    }}
                />
                <div className="relative z-[1] w-full h-full">{children}</div>
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
            <div className="z-[3] overflow-hidden">{children}</div>
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
