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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    return (
        <label className="w-full h-full" style={labelStyle}>
            {text}
        </label>
    );
};

export default PySideLabel;
