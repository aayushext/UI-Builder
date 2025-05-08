import PropTypes from "prop-types";
import componentDefinitions from "@/utils/componentDefinitions.json";

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
