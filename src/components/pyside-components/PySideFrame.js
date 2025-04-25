import React from "react";
import PropTypes from "prop-types";

const PySideFrame = ({
    backgroundColor,
    frameShape,
    frameShadow,
    lineWidth,
    midLineWidth,
    children,
}) => {
    const getBorderStyle = () => {
        if (frameShape === "NoFrame") return "none";
        if (frameShape === "HLine") return `${lineWidth}px solid black`;
        if (frameShape === "VLine") return `${lineWidth}px solid black`;

        const colorLight = "#ffffff";
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
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
    };

    return <div style={frameStyle}>{children}</div>;
};

PySideFrame.propTypes = {
    backgroundColor: PropTypes.string,
    frameShape: PropTypes.string,
    frameShadow: PropTypes.string,
    lineWidth: PropTypes.number,
    midLineWidth: PropTypes.number,
    children: PropTypes.node,
};

export default PySideFrame;
