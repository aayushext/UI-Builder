import { hexToRgba } from "@/utils/colorUtils";
import { getComponentDefinitionByType } from "@/utils/componentLoader";

/**
 * Generates the Python code for a basic PySide6 application that loads a .ui file.
 * @returns {string} The Python loader code.
 */
export const generatePythonLoaderCode = () => {
    return `
import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton, QLabel, QSlider, QFrame, QStackedWidget # Import necessary widgets
from PySide6.QtCore import QFile, QIODevice
from PySide6.QtUiTools import QUiLoader

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.ui = None # Initialize ui attribute
        self.load_ui()

    def load_ui(self):
        # Use a relative path or ensure the .ui file is in the correct location
        ui_file_path = "ui-designer.ui"
        ui_file = QFile(ui_file_path)

        if not ui_file.exists():
            print(f"UI file not found at: {ui_file_path}")
            return

        if not ui_file.open(QIODevice.ReadOnly):
            print(f"Cannot open UI file: {ui_file.errorString()}")
            return

        loader = QUiLoader()
        # Make custom widgets known to the loader if needed in the future
        # loader.registerCustomWidget(MyCustomWidget)

        try:
            self.ui = loader.load(ui_file)
        except Exception as e:
            print(f"Error loading UI file: {e}")
            print(loader.errorString())
            ui_file.close()
            return

        ui_file.close()

        if not self.ui:
            print(f"Failed to load UI: {loader.errorString()}")
            return

        # Set the loaded UI as the central widget of the QMainWindow
        self.setCentralWidget(self.ui)
        self.setWindowTitle("UI Loader") # Set a window title

        # --- Find Widgets and Connect Signals ---
        # Example: Find a button named 'myButton' and connect its clicked signal
        # try:
        #     my_button = self.ui.findChild(QPushButton, "myButton")
        #     if my_button:
        #         my_button.clicked.connect(self.on_my_button_clicked)
        #     else:
        #         print("Widget 'myButton' not found.")
        # except AttributeError as e:
        #     print(f"Error finding/connecting widget: {e}")

        # Add more findChild calls and signal connections as needed
        # self.find_and_connect_widgets() # Optional: Move finding logic to a method

        self.show() # Show the main window

    # --- Optional: Method to find and connect multiple widgets ---
    # def find_and_connect_widgets(self):
    #     widget_connections = {
    #         "button1": (QPushButton, self.on_button1_clicked),
    #         "slider1": (QSlider, self.on_slider1_value_changed, "valueChanged"), # Specify signal
    #         # Add more widgets here
    #     }
    #
    #     for name, details in widget_connections.items():
    #         widget_class = details[0]
    #         slot_function = details[1]
    #         signal_name = details[2] if len(details) > 2 else "clicked" # Default to clicked
    #
    #         try:
    #             widget = self.ui.findChild(widget_class, name)
    #             if widget:
    #                 signal = getattr(widget, signal_name)
    #                 signal.connect(slot_function)
    #             else:
    #                 print(f"Widget '{name}' not found.")
    #         except AttributeError as e:
    #             print(f"Error finding/connecting widget '{name}': {e}")
    #         except Exception as e:
    #              print(f"Unexpected error connecting widget '{name}': {e}")

    # --- Define Slot Functions (Callbacks) ---
    # def on_my_button_clicked(self):
    #     print("My Button was clicked!")
    #
    # def on_slider1_value_changed(self, value):
    #     print(f"Slider 1 value changed: {value}")

    # Add more slot functions for other connected signals

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    if window.ui: # Only run exec if UI loaded successfully
        sys.exit(app.exec())
    else:
        print("Application exiting due to UI load failure.")
        sys.exit(1) # Indicate error exit
`;
};

/**
 * Recursively generates the XML string for a component and its children.
 * @param {object} component - The component object.
 * @param {Array} allComponents - The array of all components in the screen.
 * @param {number} indentLevel - The current indentation level.
 * @returns {string} The generated XML string for the component.
 */

// Helper function to generate the <property name="geometry"> XML block.
const generateGeometryXml = (component, indentLevel) => {
    const indent = " ".repeat(indentLevel * 2);
    return `${indent}  <property name="geometry">
${indent}   <rect>
${indent}    <x>${Math.round(component.x)}</x>
${indent}    <y>${Math.round(component.y)}</y>
${indent}    <width>${Math.round(component.width)}</width>
${indent}    <height>${Math.round(component.height)}</height>
${indent}   </rect>
${indent}  </property>\n`;
};

// Helper function to generate the <property name="styleSheet"> XML block.
// It processes the styleSheet definition from componentDefinitions.json.
const generateStyleSheetXml = (component, styleSheetDef, indentLevel, componentId) => {
    const indent = " ".repeat(indentLevel * 2);
    let styleSheetString = "";

    const interpolateString = (templateString, values) => {
        // Ensure Math is available for templates like trackWidth
        const augmentedValues = { ...values, Math, hexToRgba };
        return templateString.replace(/\$\{(\w+\(?[\w,\s\(\)]*\)?\.?\w*)\}/g, (match, expression) => {
            // Allow direct property access, hexToRgba, and Math functions
            try {
                // eslint-disable-next-line no-new-func
                return new Function(...Object.keys(augmentedValues), `return ${expression}`)(...Object.values(augmentedValues));
            } catch (e) {
                console.error(`Error interpolating stylesheet template: ${expression}`, e);
                return match; // Return original placeholder on error
            }
        });
    };
    
    const processProperties = (properties, targetComponent) => {
        let result = "";
        for (const [propName, propDef] of Object.entries(properties)) {
            if (propName.startsWith("_static_")) { // Handle static properties like _static_border
                 result += `    ${propDef}\n`;
                 continue;
            }

            let value;
            let template;

            if (typeof propDef === "string") { // Simple template string "rule: ${value};"
                template = propDef;
                value = targetComponent[propName];
                 if (value === undefined && propName !== "value") { // "value" can be a direct prop
                    console.warn(`Stylesheet property ${propName} not found in component ${targetComponent.componentId}`);
                    continue;
                }
            } else { // Object definition
                template = propDef.template;
                if (propDef._value !== undefined) {
                    value = propDef._value;
                } else if (propDef._valueFrom) {
                    const sourceValues = {};
                    let allPropsFound = true;
                    for (const sourceProp of propDef._valueFrom) {
                        if (targetComponent[sourceProp] === undefined) {
                            console.warn(`Stylesheet source property ${sourceProp} for ${propName} not found in component ${targetComponent.componentId}`);
                            allPropsFound = false;
                            break;
                        }
                        sourceValues[sourceProp] = targetComponent[sourceProp];
                    }
                    if (!allPropsFound) continue;
                    value = sourceValues; // Pass the object of source values to interpolateString
                } else {
                     value = targetComponent[propName];
                     if (value === undefined) {
                        console.warn(`Stylesheet property ${propName} (object def) not found in component ${targetComponent.componentId}`);
                        continue;
                    }
                }
            }
             if (value !== undefined) {
                // Pass the component itself for direct access in more complex templates if needed
                const finalValue = typeof value === 'object' ? {...value, component: targetComponent} : { value, component: targetComponent };
                result += `    ${interpolateString(template, finalValue)}\n`;
            }
        }
        return result;
    };

    let baseSelector = styleSheetDef.selector;
    if (baseSelector.includes("${componentId}")) {
        baseSelector = baseSelector.replace("${componentId}", componentId);
    }
     if (baseSelector.includes("${orientation}")) {
        baseSelector = baseSelector.replace("${orientation}", component.orientation);
    }


    // Base properties
    if (styleSheetDef.properties) {
        const basePropsCss = processProperties(styleSheetDef.properties, component);
        if (basePropsCss) {
            styleSheetString += `${baseSelector} {\n${basePropsCss}${indent}  }\n`;
        }
    }
    
    // Simpler baseProperties (used by QSlider)
    if (styleSheetDef.baseProperties) {
        const basePropsCss = processProperties(styleSheetDef.baseProperties, component);
        if (basePropsCss) {
             // If selector is just QSlider, this is fine. If it has #comp_id, this might be redundant or an override.
            // For QSlider, this is intended to be a general style not specific to ID.
            const selectorToUse = styleSheetDef.selector.includes("#") ? styleSheetDef.selector.split("#")[0] : styleSheetDef.selector;
            styleSheetString += `${selectorToUse} {\n${basePropsCss}${indent}  }\n`;
        }
    }


    // Conditional Properties
    if (styleSheetDef.conditionalProperties) {
        styleSheetDef.conditionalProperties.forEach(condProp => {
            // Basic condition evaluation (e.g., "useCustomBorder === true")
            // A safer method than eval would be preferred for complex conditions
            let conditionMet = false;
            try {
                // eslint-disable-next-line no-new-func
                conditionMet = new Function(...Object.keys(component), `return ${condProp.condition};`)(...Object.values(component));
            } catch (e) {
                console.error(`Error evaluating conditional property condition: ${condProp.condition}`, e);
            }

            if (conditionMet) {
                const conditionalCss = processProperties(condProp.properties, component);
                if (conditionalCss) {
                    styleSheetString += `${baseSelector} {\n${conditionalCss}${indent}  }\n`; // Assuming applies to base selector
                }
            }
        });
    }

    // States
    if (styleSheetDef.states) {
        for (const [stateName, stateDef] of Object.entries(styleSheetDef.states)) {
            const stateSelector = baseSelector + stateDef.selectorSuffix;
            const stateCss = processProperties(stateDef.properties, component);
            if (stateCss) {
                styleSheetString += `${stateSelector} {\n${stateCss}${indent}  }\n`;
            }
        }
    }

    // Sub-Controls
    if (styleSheetDef.subControls) {
        styleSheetDef.subControls.forEach(subControl => {
            let subControlSelector = styleSheetDef.selector; // Start with the base selector of the component (e.g. QSlider)
            // Append suffix, interpolating component properties like orientation
            const suffix = interpolateString(subControl.selectorSuffix, component);
            subControlSelector += suffix;
            
            const subControlCss = processProperties(subControl.properties, component);
            if (subControlCss) {
                styleSheetString += `${subControlSelector} {\n${subControlCss}${indent}  }\n`;
            }
        });
    }
    
    if (styleSheetString.trim()) {
        // Escape XML characters in the stylesheet string
        const escapedStyleSheet = styleSheetString
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        return `${indent}  <property name="styleSheet">\n${indent}    <string>${escapedStyleSheet.trim()}</string>\n${indent}  </property>\n`;
    }
    return "";
};

/**
 * Generates the XML string for a single component based on its definition in componentDefinitions.json.
 * This function is data-driven by the `qtXml` property in the component's definition.
 * It utilizes helper functions like `generateGeometryXml` and `generateStyleSheetXml`
 * to construct the final XML structure for the component and its children (if any).
 *
 * @param {object} component - The component object from the application state.
 * @param {Array} allComponents - The array of all components in the current screen.
 * @param {number} indentLevel - The current indentation level for XML formatting.
 * @returns {string} The generated XML string for the component.
 */
const generateComponentXml = (component, allComponents, indentLevel) => {
    const indent = " ".repeat(indentLevel * 2);
    let xml = "";

    const definition = getComponentDefinitionByType(component.type);
    if (!definition || !definition.qtXml) {
        console.error(`No qtXml definition for component type ${component.type}`);
        return `<!-- Error: No qtXml definition for component type ${component.type} -->\n`;
    }
    const qtXml = definition.qtXml;

    const compNameProperty = qtXml.nameProperty || "componentId";
    const compName = component[compNameProperty] || `${component.type.toLowerCase()}_${component.id}`;
    const safeCompName = compName.replace(/[^a-zA-Z0-9_]/g, "_");

    xml += `${indent}<widget class="${qtXml.class}" name="${safeCompName}">\n`;

    // Geometry
    if (qtXml.geometry) {
        xml += generateGeometryXml(component, indentLevel);
    }

    // Direct Qt Properties
    if (qtXml.directProperties) {
        for (const [propName, propDef] of Object.entries(qtXml.directProperties)) {
            const value = component[propName];
            if (value !== undefined) {
                xml += `${indent}  <property name="${propName}">\n`;
                if (propDef.type === "enum") {
                    const prefix = propDef.prefix || "";
                    const enumValue = propDef.map ? (propDef.map[value] || value) : value;
                    xml += `${indent}    <enum>${prefix}${enumValue}</enum>\n`;
                } else if (propDef.type === "number") {
                    xml += `${indent}    <number>${value}</number>\n`;
                } else {
                    // Fallback for other types, assuming string or direct value
                     xml += `${indent}    <string>${String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</string>\n`;
                }
                xml += `${indent}  </property>\n`;
            }
        }
    }

    // Mapped Qt Properties
    if (qtXml.propertiesMap) {
        for (const [compPropName, propDef] of Object.entries(qtXml.propertiesMap)) {
            let value = component[compPropName];
            if (value !== undefined) {
                if (propDef.valueMap) {
                    value = propDef.valueMap[value] || propDef.defaultValue;
                }
                
                // Escape XML characters for string properties
                const displayValue = propDef.isString && typeof value === 'string' 
                    ? value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    : value;

                xml += `${indent}  <property name="${propDef.name}">\n`;
                if (propDef.isString) {
                    xml += `${indent}    <string>${displayValue}</string>\n`;
                } else if (propDef.isSet) {
                    xml += `${indent}    <set>${displayValue}</set>\n`;
                } else { // Default to number or direct value
                    xml += `${indent}    <number>${displayValue}</number>\n`;
                }
                xml += `${indent}  </property>\n`;
            }
        }
    }

    // StyleSheet
    if (qtXml.styleSheet) {
        xml += generateStyleSheetXml(component, qtXml.styleSheet, indentLevel, safeCompName);
    }

    // Children (typically for QFrame or similar container widgets)
    if (qtXml.class === "QFrame" || qtXml.canHaveChildren) { // Added canHaveChildren for future flexibility
        const children = allComponents.filter(
            (comp) => comp.parentId === component.id
        );
        children.forEach((child) => {
            xml += generateComponentXml(
                child,
                allComponents,
                indentLevel + 1
            );
        });
    }

    xml += `${indent}</widget>\n`;
    return xml;
};

/**
 * Generates the complete Qt Designer .ui file content as an XML string.
 * @param {Array} screens - Array of screen objects.
 * @param {number} currentScreenIndex - The index of the currently visible screen.
 * @returns {string} The generated .ui file content.
 */
export const generateQtUiFile = (screens, currentScreenIndex) => {
    const currentScreen = screens[currentScreenIndex];
    if (!currentScreen) {
        console.error("Current screen not found for UI generation.");
        return '<?xml version="1.0" encoding="UTF-8"?><ui version="4.0"><error>Current screen not found</error></ui>';
    }

    let uiCode = `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>MainWindow</class>
 <widget class="QMainWindow" name="MainWindow">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>${currentScreen.width || 1280}</width>
    <height>${currentScreen.height || 800}</height>
   </rect>
  </property>
  <property name="windowTitle">
     <string>MainWindow</string>
  </property>
  <widget class="QWidget" name="centralwidget"> <!-- Central widget is needed -->
   <widget class="QStackedWidget" name="stackedWidget">
    <property name="geometry">
     <rect>
      <x>0</x> <!-- StackedWidget should fill centralwidget -->
      <y>0</y>
      <width>${currentScreen.width || 1280}</width>
      <height>${currentScreen.height || 800}</height>
     </rect>
    </property>\n`;

    screens.forEach((screen, screenIndex) => {
        const screenId = (screen.customId || `screen_${screenIndex}`).replace(
            /[^a-zA-Z0-9_]/g,
            "_"
        );
        const allComponents = screen.components;
        const topLevelComponents = allComponents.filter(
            (comp) => comp.parentId === null
        );

        uiCode += `    <widget class="QWidget" name="${screenId}">
     <property name="styleSheet">
      <string>QWidget#${screenId} { background-color: rgba(${hexToRgba(
          screen.backgroundColor
      )}); }</string>
     </property>\n`;

        topLevelComponents.forEach((component) => {
            uiCode += generateComponentXml(component, allComponents, 3);
        });

        uiCode += `    </widget>\n`;
    });

    uiCode += `    <property name="currentIndex">
     <number>0</number>
    </property>
   </widget>
  </widget>
 </widget>
 <resources/>
 <connections/>
</ui>
`;
    return uiCode;
};
