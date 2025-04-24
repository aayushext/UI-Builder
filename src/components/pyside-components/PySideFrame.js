import React from "react";

const PySideFrame = ({
    backgroundColor,
    frameShape,
    frameShadow,
    lineWidth,
    midLineWidth,
    children, // Child Widgets are passed down
}) => {
    // Basic style mapping - this is a simplified representation
    const getBorderStyle = () => {
        if (frameShape === "NoFrame") return "none";
        if (frameShape === "HLine") return `${lineWidth}px solid black`; // Simplified
        if (frameShape === "VLine") return `${lineWidth}px solid black`; // Simplified

        const colorLight = "#ffffff"; // Simplified shadow colors
        const colorDark = "#808080";
        const colorMid = "#c0c0c0";

        let borderStyle = `${lineWidth}px solid`;
        let boxShadow = "none";

        if (frameShadow === "Raised") {
            borderStyle += ` ${colorLight}`;
            boxShadow = `${lineWidth}px ${lineWidth}px 0 ${colorDark}`;
        } else if (frameShadow === "Sunken") {
            borderStyle += ` ${colorDark}`;
            boxShadow = `${lineWidth}px ${lineWidth}px 0 ${colorLight} inset`;
        } else {
            // Plain
            borderStyle += ` ${colorMid}`;
        }

        // Mid-line width isn't easily representable with standard CSS borders/shadows
        // This is a very basic approximation
        if (midLineWidth > 0 && frameShape !== "NoFrame") {
            // Could add another inner shadow or border, but gets complex
        }

        return borderStyle;
    };

    const frameStyle = {
        width: "100%",
        height: "100%",
        backgroundColor: backgroundColor,
        border: getBorderStyle(),
        // boxShadow: getBoxShadow(), // Simplified border handles basic shadow
        overflow: "hidden", // Hide children overflowing the frame bounds
        position: "relative", // Crucial: Establish positioning context for children
        boxSizing: "border-box",
    };

    return <div style={frameStyle}>{children}</div>; // Render child Widgets inside
};

export default PySideFrame;
