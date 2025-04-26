import { useState } from "react";
import PropTypes from "prop-types";

const PySideButton = ({
    text,
    fontSize,
    textColor,
    backgroundColor,
    radius,
    pressedColor,
    hoverColor,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    let currentBackgroundColor = backgroundColor;
    if (isPressed) {
        currentBackgroundColor = pressedColor;
    } else if (isHovered) {
        currentBackgroundColor = hoverColor;
    }

    const buttonStyle = {
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: currentBackgroundColor,
        borderRadius: `${radius}px`,
    };

    return (
        <button
            className="w-full h-full border-none px-4 py-2.5 cursor-pointer transition-colors duration-200 ease-in-out"
            style={buttonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseOut={() => setIsPressed(false)}>
            {text}
        </button>
    );
};

PySideButton.propTypes = {
    text: PropTypes.string,
    fontSize: PropTypes.number,
    textColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    radius: PropTypes.number,
    pressedColor: PropTypes.string,
    hoverColor: PropTypes.string,
};

export default PySideButton;
