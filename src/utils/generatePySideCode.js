import { hexToRgba } from "@/utils/colorUtils";

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
const generateComponentXml = (component, allComponents, indentLevel) => {
    const indent = " ".repeat(indentLevel * 2);
    let xml = "";
    const compNameRaw =
        component.componentId ||
        `${component.type}${component.id}_screen${component.parentId ?? "root"}`;
    const compName = compNameRaw.replace(/[^a-zA-Z0-9_]/g, "_");

    const commonGeometry = `${indent}  <property name="geometry">
${indent}   <rect>
${indent}    <x>${Math.round(component.x)}</x>
${indent}    <y>${Math.round(component.y)}</y>
${indent}    <width>${Math.round(component.width)}</width>
${indent}    <height>${Math.round(component.height)}</height>
${indent}   </rect>
${indent}  </property>\n`;

    if (component.type === "PySideButton") {
        xml += `${indent}<widget class="QPushButton" name="${compName}">\n`;
        xml += `${indent}  <property name="text">
${indent}    <string>${
            component.text?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || ""
        }</string>
${indent}  </property>\n`;
        xml += commonGeometry;
        xml += `${indent}  <property name="styleSheet">
${indent}    <string>
${indent}QPushButton {
${indent}    color: rgba(${hexToRgba(component.textColor)});
${indent}    background-color: rgba(${hexToRgba(component.backgroundColor)});
${indent}    font-size: ${component.fontSize}px;
${indent}    font-family: Arial;
${indent}    border: ${component.borderWidth}px solid rgba(${hexToRgba(
            component.borderColor
        )});
${indent}    border-radius: ${component.radius}px;
${indent}}
${indent}QPushButton:hover {
${indent}    background-color: rgba(${hexToRgba(component.hoverColor)});
${indent}    border-color: rgba(${hexToRgba(
            component.hoverBorderColor ?? component.borderColor
        )});
${indent}}
${indent}QPushButton:pressed {
${indent}    background-color: rgba(${hexToRgba(component.pressedColor)});
${indent}    border-color: rgba(${hexToRgba(
            component.pressedBorderColor ?? component.borderColor
        )});
${indent}}
${indent}    </string>
${indent}  </property>\n`;
        xml += `${indent}</widget>\n`;
    } else if (component.type === "PySideLabel") {
        xml += `${indent}<widget class="QLabel" name="${compName}">\n`;
        xml += `${indent}  <property name="text">
${indent}    <string>${
            component.text?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || ""
        }</string>
${indent}  </property>\n`;
        xml += commonGeometry;
        xml += `${indent}  <property name="styleSheet">
${indent}    <string>
${indent}QLabel {
${indent}    color: rgba(${hexToRgba(component.textColor)});
${indent}    background-color: rgba(${hexToRgba(component.backgroundColor)});
${indent}    border-radius: ${component.radius}px;
${indent}    font-size: ${component.fontSize}px;
${indent}    font-family: Arial;
${indent}    border: ${component.borderWidth}px solid rgba(${hexToRgba(
            component.borderColor
        )});
${indent}
${indent}}
${indent}    </string>
${indent}  </property>\n`;
        xml += `${indent}  <property name="alignment">
${indent}    <set>Qt::Align${
            component.textAlign === "left"
                ? "Left"
                : component.textAlign === "right"
                  ? "Right"
                  : "Center"
        }|Qt::AlignVCenter</set>
${indent}  </property>\n`;
        xml += `${indent}</widget>\n`;
    } else if (component.type === "PySideSlider") {
        const orientation =
            component.orientation === "vertical"
                ? "Qt::Orientation::Vertical"
                : "Qt::Orientation::Horizontal";
        xml += `${indent}<widget class="QSlider" name="${compName}">\n`;
        xml += `${indent}  <property name="orientation">
${indent}    <enum>${orientation}</enum>
${indent}  </property>\n`;
        xml += `${indent}  <property name="minimum">
${indent}    <number>${component.minimum}</number>
${indent}  </property>\n`;
        xml += `${indent}  <property name="maximum">
${indent}    <number>${component.maximum}</number>
${indent}  </property>\n`;
        xml += `${indent}  <property name="value">
${indent}    <number>${component.value}</number>
${indent}  </property>\n`;
        xml += commonGeometry;
        xml += `${indent}  <property name="styleSheet">
${indent}    <string>
${indent}/* Base Slider Style */
${indent}QSlider {
${indent}    background-color: rgba(${hexToRgba(component.backgroundColor)});
${indent}}
${indent}/* Groove (Track) */
${indent}QSlider::groove:${component.orientation ?? "horizontal"} {
${indent}    background: rgba(${hexToRgba(component.trackColor)});
${indent}    border: 1px solid rgba(150, 150, 150, 1);
${indent}    border-radius: ${Math.round((component.trackWidth ?? 8) / 2)}px;
${indent}    ${
            component.orientation === "vertical"
                ? `width: ${component.trackWidth ?? 8}px; margin: 0 4px;`
                : `height: ${component.trackWidth ?? 8}px; margin: 4px 0;`
        }
${indent}}
${indent}/* Handle (Thumb) */
${indent}QSlider::handle:${component.orientation ?? "horizontal"} {
${indent}    background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 rgba(${hexToRgba(
            component.sliderColor
        )}), stop:1 rgba(${hexToRgba(component.sliderColor, 0.8)})); /* Gradient */
${indent}    border: 1px solid rgba(50, 50, 50, 1);
${indent}    width: 18px;  /* Slightly larger handle */
${indent}    height: 18px;
${indent}    ${
            component.orientation === "vertical"
                ? "margin: 0 -5px;"
                : "margin: -5px 0;"
        }
${indent}    border-radius: 9px; /* Fully rounded */
${indent}}
${indent}/* Handle Hover/Pressed States (Optional) */
${indent}QSlider::handle:${component.orientation ?? "horizontal"}:hover {
${indent}    background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 rgba(${hexToRgba(
            component.sliderColor,
            1.1
        )}), stop:1 rgba(${hexToRgba(component.sliderColor, 0.9)}));
${indent}}
${indent}QSlider::handle:${component.orientation ?? "horizontal"}:pressed {
${indent}    background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 rgba(${hexToRgba(
            component.sliderColor,
            0.8
        )}), stop:1 rgba(${hexToRgba(component.sliderColor, 0.7)}));
${indent}}
${indent}    </string>
${indent}  </property>\n`;
        xml += `${indent}</widget>\n`;
    } else if (component.type === "PySideFrame") {
        xml += `${indent}<widget class="QFrame" name="${compName}">\n`;
        xml += commonGeometry;
        const borderStyle = component.useCustomBorder
            ? `${indent}          border: ${
                  component.borderWidth
              }px solid rgba(${hexToRgba(component.borderColor)});`
            : "";

        xml += `${indent}  <property name="styleSheet">
${indent}      <string>QFrame#${compName} {
${indent}          background-color: rgba(${hexToRgba(
            component.backgroundColor
        )});
${indent}          border-radius: ${component.radius}px;        
${borderStyle ? borderStyle + "\n" : ""}${indent}      }</string>
${indent}  </property>\n`;
        xml += `${indent}  <property name="frameShape">
${indent}      <enum>QFrame::${component.frameShape ?? "StyledPanel"}</enum>
${indent}  </property>\n`;
        xml += `${indent}  <property name="frameShadow">
${indent}      <enum>QFrame::${component.frameShadow ?? "Sunken"}</enum>
${indent}  </property>\n`;
        xml += `${indent}  <property name="lineWidth">
${indent}      <number>${component.lineWidth ?? 1}</number>
${indent}  </property>\n`;
        xml += `${indent}  <property name="midLineWidth">
${indent}      <number>${component.midLineWidth ?? 0}</number>
${indent}  </property>\n`;

        const children = allComponents.filter(
            (comp) => comp.parentId === component.id
        );
        let childrenXml = "";
        children.forEach((child) => {
            childrenXml += generateComponentXml(
                child,
                allComponents,
                indentLevel + 1
            );
        });

        if (childrenXml) {
            xml += childrenXml;
        }

        xml += `${indent}</widget>\n`;
    }

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
     <number>${currentScreenIndex}</number>
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
