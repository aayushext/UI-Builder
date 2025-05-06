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
    borderColor,
    borderWidth,
    hoverBorderColor,
    pressedBorderColor,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    let currentBackgroundColor = backgroundColor;
    let currentBorderColor = borderColor;

    if (isPressed) {
        currentBackgroundColor = pressedColor;
        currentBorderColor = pressedBorderColor ?? borderColor;
    } else if (isHovered) {
        currentBackgroundColor = hoverColor;
        currentBorderColor = hoverBorderColor ?? borderColor;
    }

    const buttonStyle = {
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: currentBackgroundColor,
        borderRadius: `${radius}px`,
        border: `${borderWidth}px solid ${currentBorderColor}`,
    };

    return (
        <button
            className="w-full h-full px-4 py-2.5 cursor-pointer transition-colors duration-200 ease-in-out box-border motion-scale-in-[1.5] motion-opacity-in-[0%] motion-duration-[250ms] motion-ease-spring-bouncier"
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
    borderColor: PropTypes.string,
    borderWidth: PropTypes.number,
    hoverBorderColor: PropTypes.string,
    pressedBorderColor: PropTypes.string,
};

export default PySideButton;
