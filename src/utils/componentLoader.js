/**
 * @file componentLoader.js
 * This file is responsible for loading component definitions from componentDefinitions.json,
 * creating new component instances, and mapping component types to their corresponding
 * React components for rendering in the UI.
 */
import PropTypes from "prop-types";
import componentDefinitions from "@/utils/componentDefinitions.json";

// Import React components
// These are the actual React components used for previewing widgets in the center panel.
import PySideButton from '../components/pyside-components/PySideButton';
import PySideLabel from '../components/pyside-components/PySideLabel';
import PySideSlider from '../components/pyside-components/PySideSlider';
import PySideFrame from '../components/pyside-components/PySideFrame';
import PySideCheckBox from '../components/pyside-components/PySideCheckBox'; // Import the new component
// Placeholder for other existing components if any:
// import ExistingComponent1 from '../components/pyside-components/ExistingComponent1';

/**
 * @const componentMap
 * This object maps the `jsComponent` string names (defined in `componentDefinitions.json`)
 * to the actual imported React component modules.
 * When adding a new React component for widget preview, it must be imported here
 * and added to this map.
 */
const componentMap = {
  "PySideButton": PySideButton,
  "PySideLabel": PySideLabel,
  "PySideSlider": PySideSlider,
  "PySideFrame": PySideFrame,
  "PySideCheckBox": PySideCheckBox, // Add to map
  // "ExistingComponent1": ExistingComponent1,
  // New components will be added here
};

/**
 * Gets all component definitions.
 * @returns {Array} Array of component definition objects.
 */
export const getComponentDefinitions = () => {
    if (
        !componentDefinitions ||
        !Array.isArray(componentDefinitions.components)
    ) {
        console.error("Invalid componentDefinitions.json structure.");
        return [];
    }
    return componentDefinitions.components;
};

/**
 * Gets the definition for a specific component type.
 * @param {string} type - The component type (e.g., 'PySideButton').
 * @returns {object | undefined} The component definition object or undefined if not found.
 */
export const getComponentDefinitionByType = (type) => {
    const definitions = getComponentDefinitions();
    const definition = definitions.find((component) => component.type === type);
    if (!definition) {
        console.warn(`Component type "${type}" not found in definitions.`);
    }
    return definition;
};

/**
 * Creates a new component instance based on its type definition.
 * @param {string} type - The component type.
 * @param {number} id - The unique ID for the new component.
 * @param {{x: number, y: number}} [position={ x: 50, y: 50 }] - Initial position.
 * @returns {object} The new component object.
 * @throws {Error} If the component type is not found.
 */
export const createComponent = (type, id, position = { x: 50, y: 50 }) => {
    const definition = getComponentDefinitionByType(type);

    if (!definition) {
        throw new Error(`Component type "${type}" not found in definitions`);
    }

    if (!definition.defaultProps) {
        console.warn(
            `Component type "${type}" definition is missing defaultProps.`
        );
        const localDefaultProps = {};
    }

    const componentId = `${type.toLowerCase()}${id}`;

    return {
        id,
        type,
        x: position.x,
        y: position.y,
        parentId: null,
        componentId: componentId,
        ...(definition.defaultProps || localDefaultProps),
    };
};

// PropTypes (optional but good practice if using prop-types elsewhere)
getComponentDefinitions.propTypes = {};
getComponentDefinitionByType.propTypes = {
    type: PropTypes.string.isRequired,
};
createComponent.propTypes = {
    type: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
    }),
};

/**
 * Gets the React component constructor for a specific component type.
 * This function uses the `jsComponent` field from the component's definition
 * (fetched from `componentDefinitions.json`) to look up the actual React component
 * in the `componentMap`.
 * @param {string} type - The component type (e.g., 'PySideButton').
 * @returns {React.ComponentType | null} The React component or null if not found.
 */
export const getReactComponentByType = (type) => {
    const definition = getComponentDefinitionByType(type); 
    const componentName = definition?.jsComponent;
    if (componentName && componentMap[componentName]) {
        return componentMap[componentName];
    }
    console.warn(`React component for type "${type}" (mapped to name "${componentName}") not found.`);
    return null; // Or return a default placeholder React component
};

getReactComponentByType.propTypes = {
    type: PropTypes.string.isRequired,
};
