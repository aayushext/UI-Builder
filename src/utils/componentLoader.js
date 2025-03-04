import componentDefinitions from "./componentDefinitions.json";

export const getComponentDefinitions = () => {
  return componentDefinitions.components;
};

export const getComponentDefinitionByType = (type) => {
  return componentDefinitions.components.find(
    (component) => component.type === type
  );
};

export const createComponent = (type, id, position = { x: 50, y: 50 }) => {
  const definition = getComponentDefinitionByType(type);

  if (!definition) {
    throw new Error(`Component type "${type}" not found in definitions`);
  }

  return {
    id,
    type,
    x: position.x,
    y: position.y,
    ...definition.defaultProps,
  };
};
