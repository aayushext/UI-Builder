import PropTypes from "prop-types";

const PySideLabel = ({
    text,
    fontSize,
    textColor,
    backgroundColor,
    borderColor,
    radius,
}) => {
    const labelStyle = {
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        borderRadius: `${radius}px`,
        border: `1px solid ${borderColor}`,
    };

    return (
        <label
            className="w-full h-full flex items-center justify-center"
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
};

export default PySideLabel;
