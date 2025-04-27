import PropTypes from "prop-types";

const PySideLabel = ({
    text,
    fontSize,
    textColor,
    backgroundColor,
    borderColor,
    radius,
    borderWidth,
    textAlign = "center",
}) => {
    const labelStyle = {
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        borderRadius: `${radius}px`,
        border: `${borderWidth}px solid ${borderColor}`,
        textAlign: textAlign,
        padding: `0 ${
            textAlign === "left" ? "8px" : textAlign === "right" ? "8px" : "4px"
        }`,
    };

    let justificationClass = "justify-center";
    if (textAlign === "left") {
        justificationClass = "justify-start";
    } else if (textAlign === "right") {
        justificationClass = "justify-end";
    }

    return (
        <label
            className={`w-full h-full flex items-center ${justificationClass} box-border overflow-hidden whitespace-nowrap`} // Added box-border, overflow, whitespace, justification
            style={labelStyle}>
            {text}
        </label>
    );
};

PySideLabel.propTypes = {
    text: PropTypes.string,
    fontSize: PropTypes.number,
    textColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    radius: PropTypes.number,
    borderWidth: PropTypes.number,
    textAlign: PropTypes.oneOf(["left", "center", "right"]),
};

export default PySideLabel;
