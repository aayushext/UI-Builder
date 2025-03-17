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
        display: "flex", // Use flexbox for centering
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally
    };

    return (
        <label
            className="w-full h-full" // Take up full width and height
            style={labelStyle}>
            {text}
        </label>
    );
};

export default PySideLabel;
