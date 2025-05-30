// Example structure for PySideCheckBox.js
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const PySideCheckBox = ({
    id, // componentId from the store, might be just 'componentId' in props
    text,
    fontSize,
    textColor,
    checked: initialChecked,
    // ... other props like width, height passed by Widget wrapper
}) => {
    // Internal state to manage visual feedback if needed, or rely on props for controlled component
    const [isChecked, setIsChecked] = useState(initialChecked);

    useEffect(() => {
        setIsChecked(initialChecked);
    }, [initialChecked]);

    const labelStyle = {
        fontSize: `${fontSize}px`,
        color: textColor,
        marginLeft: '8px', // Spacing between checkbox and text
    };

    // Note: The component itself doesn't handle property updates back to the store.
    // That's managed by RightPanel. This is for display.
    // For the visual preview, direct interaction (clicking the checkbox) won't update the store
    // unless we add specific event handlers to call store functions, which is out of scope for this step.
    // We are primarily testing the definition-to-render and definition-to-XML pipeline.

    return (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}
            className="motion-scale-in-[1.5] motion-opacity-in-[0%] motion-duration-[250ms] motion-ease-spring-bouncier">
            <input
                type="checkbox"
                checked={isChecked}
                readOnly // Important: Preview is read-only unless explicitly wired to store
                style={{ accentColor: textColor }} // Basic styling for checkbox color
            />
            <label style={labelStyle}>{text}</label>
        </div>
    );
};

PySideCheckBox.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string,
    fontSize: PropTypes.number,
    textColor: PropTypes.string,
    checked: PropTypes.bool,
};

PySideCheckBox.defaultProps = {
    text: 'Checkbox',
    fontSize: 14,
    textColor: '#000000',
    checked: false,
};

export default PySideCheckBox;
