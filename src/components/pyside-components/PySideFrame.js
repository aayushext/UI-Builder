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
        ctx.lineTo(width - lineW * 2 - midLineW, height - lineW * 2 - midLineW);
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
};

/**
 * Canvas for drawing groove/raised/sunken frames.
 */
const BoxFrameCanvas = ({
    width,
    height,
    lineW,
    midLineW,
    frameShape,
    frameShadow,
    backgroundColor,
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
    });

    useEffect(() => {
        if (
            prev.current.width === width &&
            prev.current.height === height &&
            prev.current.lineW === lineW &&
            prev.current.midLineW === midLineW &&
            prev.current.frameShape === frameShape &&
            prev.current.frameShadow === frameShadow &&
            prev.current.backgroundColor === backgroundColor
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
        };

        if (!width || !height) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        const baseColor = backgroundColor || "#e0e0e0";
        const colorLight = lightenColor(baseColor, 30);
        const colorDark = darkenColor(baseColor, 30);
        const colorMid = darkenColor(baseColor, 60);

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Draw groove border
        if (frameShadow === "Raised") {
            drawRaisedFrame(
                ctx,
                width,
                height,
                lineW,
                midLineW,
                frameShape,
                colorLight,
                colorDark
            );
        } else if (frameShadow === "Sunken") {
            drawRaisedFrame(
                ctx,
                width,
                height,
                lineW,
                midLineW,
                frameShape,
                colorDark,
                colorLight
            );
        } else {
            ctx.strokeStyle = colorMid;
            ctx.lineWidth = lineW;
            ctx.strokeRect(
                lineW / 2,
                lineW / 2,
                Math.max(0, width - lineW),
                Math.max(0, height - lineW)
            );
        }

        if (midLineW > 0) {
            ctx.strokeStyle = colorMid;
            ctx.lineWidth = midLineW;
            ctx.strokeRect(
                lineW + midLineW / 2,
                lineW + midLineW / 2,
                Math.max(0, width - lineW * 2 - midLineW),
                Math.max(0, height - lineW * 2 - midLineW)
            );
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

/**
 * PySideFrame - Professional, flexible frame component.
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
}) => {
    // Calculate line widths
    const lineW = lineWidth !== undefined ? Math.max(0, lineWidth) : 1;
    const midLineW = midLineWidth !== undefined ? Math.max(0, midLineWidth) : 0;
    const totalWidth = lineW + midLineW;
    const baseColor = backgroundColor || "#e0e0e0";
    const colorLight = lightenColor(baseColor, 30);
    const colorDark = darkenColor(baseColor, 30);
    const colorMid = darkenColor(baseColor, 10);
    const colorMidLight = lightenColor(baseColor, 15);
    const colorMidDark = darkenColor(baseColor, 15);

    // Base style
    const style = {
        backgroundColor,
        boxShadow: "none",
        boxSizing: "border-box",
        height: "100%",
        width: "100%",
        borderTop: "none",
        borderRight: "none",
        borderBottom: "none",
        borderLeft: "none",
        position: "relative",
        overflow: "hidden",
    };

    // Custom border override
    if (useCustomBorder) {
        style.borderTop =
            style.borderRight =
            style.borderBottom =
            style.borderLeft =
                `${borderWidth}px solid ${borderColor}`;
        return (
            <div className="w-full h-full relative" style={style}>
                {children}
            </div>
        );
    }

    // Groove/Panel/WinPanel with Raised/Sunken shadow
    const isGrooveFrame =
        (frameShape === "Box" ||
            frameShape === "Panel" ||
            frameShape === "WinPanel") &&
        (frameShadow === "Raised" || frameShadow === "Sunken") &&
        typeof width === "number" &&
        typeof height === "number" &&
        width > 0 &&
        height > 0;

    if (isGrooveFrame) {
        return (
            <div
                className="w-full h-full relative"
                style={{ ...style, backgroundColor }}>
                <BoxFrameCanvas
                    width={width}
                    height={height}
                    lineW={lineW}
                    midLineW={midLineW}
                    frameShape={frameShape}
                    frameShadow={frameShadow}
                    backgroundColor={backgroundColor}
                />
                {frameShape === "Box" && (
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            zIndex: 3,
                        }}>
                        {children}
                    </div>
                )}
            </div>
        );
    }

    // HLine/VLine logic
    if (frameShape === "HLine" || frameShape === "VLine") {
        style.backgroundColor = "transparent";
        style.boxShadow = "none";
        if (totalWidth <= 0)
            return (
                <div className="w-full h-full relative" style={style}>
                    {children}
                </div>
            );
        if (frameShape === "HLine") {
            style.height = `${totalWidth}px`;
            if (frameShadow === "Raised") {
                style.borderTop = `${lineW}px solid ${colorLight}`;
                style.borderBottom = `${lineW}px solid ${colorDark}`;
            } else if (frameShadow === "Sunken") {
                style.borderTop = `${lineW}px solid ${colorDark}`;
                style.borderBottom = `${lineW}px solid ${colorLight}`;
            } else {
                style.borderTop = `${totalWidth}px solid ${colorDark}`;
            }
        } else {
            style.width = `${totalWidth}px`;
            if (frameShadow === "Raised") {
                style.borderLeft = `${lineW}px solid ${colorLight}`;
                style.borderRight = `${lineW}px solid ${colorDark}`;
            } else if (frameShadow === "Sunken") {
                style.borderLeft = `${lineW}px solid ${colorDark}`;
                style.borderRight = `${lineW}px solid ${colorLight}`;
            } else {
                style.borderLeft = `${totalWidth}px solid ${colorDark}`;
            }
        }
        return (
            <div className="w-full h-full relative" style={style}>
                {children}
            </div>
        );
    }

    // NoFrame logic
    if (frameShape === "NoFrame") {
        return (
            <div className="w-full h-full relative" style={style}>
                {children}
            </div>
        );
    }

    // Plain frame with no width
    if (totalWidth <= 0 && frameShadow === "Plain") {
        return (
            <div className="w-full h-full relative" style={style}>
                {children}
            </div>
        );
    }

    // Determine plain border color
    let plainBorderColor = colorDark;
    if (frameShape === "StyledPanel") plainBorderColor = colorMidDark;

    // Main frame rendering logic
    if (frameShadow === "Raised") {
        if (totalWidth > 0) {
            style.boxShadow = `inset ${lineW}px ${lineW}px 0 0 ${colorLight}, inset -${lineW}px -${lineW}px 0 0 ${colorDark}${midLineW > 0 ? `, inset 0 0 0 ${midLineW}px ${colorMid}` : ""}`;
        }
        if (["Panel", "WinPanel"].includes(frameShape)) {
            style.borderTop =
                style.borderRight =
                style.borderBottom =
                style.borderLeft =
                    `1px solid ${colorMid}`;
        } else if (frameShape === "StyledPanel") {
            style.borderTop =
                style.borderRight =
                style.borderBottom =
                style.borderLeft =
                    `${totalWidth}px solid ${colorMidLight}`;
            style.boxShadow = "none";
        }
    } else if (frameShadow === "Sunken") {
        if (totalWidth > 0) {
            style.boxShadow = `inset ${lineW}px ${lineW}px 0 0 ${colorDark}, inset -${lineW}px -${lineW}px 0 0 ${colorLight}${midLineW > 0 ? `, inset 0 0 0 ${midLineW}px ${colorMid}` : ""}`;
        }
        if (["Panel", "WinPanel"].includes(frameShape)) {
            style.borderTop =
                style.borderRight =
                style.borderBottom =
                style.borderLeft =
                    `1px solid ${colorMid}`;
        } else if (frameShape === "StyledPanel") {
            style.borderTop =
                style.borderRight =
                style.borderBottom =
                style.borderLeft =
                    `${totalWidth}px solid ${colorMidDark}`;
            style.boxShadow = "none";
        }
    } else {
        if (totalWidth > 0) {
            style.borderTop =
                style.borderRight =
                style.borderBottom =
                style.borderLeft =
                    `${totalWidth}px solid ${plainBorderColor}`;
        }
        style.boxShadow = "none";
    }

    return (
        <div className="w-full h-full relative" style={style}>
            {children}
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
};

export default PySideFrame;
