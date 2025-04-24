const hexToRgba = (hex) => {
    if (!hex) return "0, 0, 0, 1";

    hex = hex.replace("#", "");
    let r,
        g,
        b,
        a = 1;

    if (hex.length === 3) {
        // Handle shorthand hex format (#RGB)
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        // Handle standard hex format (#RRGGBB)
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
        // Handle hex format with alpha (#RRGGBBAA)
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
        // Default to black if invalid format
        return "0, 0, 0, 1";
    }

    return `${r}, ${g}, ${b}, ${a}`;
};

export const generatePythonLoaderCode = () => {
    return `
import sys
from PySide6.QtWidgets import QApplication, QMainWindow
from PySide6.QtCore import QFile, QIODevice
from PySide6.QtUiTools import QUiLoader

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.load_ui()
        
    def load_ui(self):
        ui_file = QFile("ui-designer.ui")
        if not ui_file.open(QIODevice.ReadOnly):
            print(f"Cannot open UI file: {ui_file.errorString()}")
            return
            
        loader = QUiLoader()
        self.ui = loader.load(ui_file)
        ui_file.close()
        
        if not self.ui:
            print(loader.errorString())
            return
            
        self.ui.show()
        
        # Connect any signals/slots here
        # Example: self.ui.findChild(QPushButton, "myButton").clicked.connect(self.button_clicked)
    
    # Define your slot functions here
    # def button_clicked(self):
    #     print("Button clicked!")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    sys.exit(app.exec())
`;
};

const generateComponentXml = (component, allComponents, indentLevel) => {
    const indent = " ".repeat(indentLevel * 2);
    let xml = "";
    const compName =
        component.componentId ||
        `${component.type}${component.id}_screen${component.parentId ?? "root"}`; // Use ID for uniqueness

    // Log component being processed
    console.log(
        `${indent}Processing Component: ID=${component.id}, Type=${component.type}, ParentID=${component.parentId}, Name=${compName}`
    );

    const commonGeometry = `${indent}  <property name="geometry">
${indent}   <rect>
${indent}    <x>${component.x}</x>
${indent}    <y>${component.y}</y>
${indent}    <width>${component.width}</width>
${indent}    <height>${component.height}</height>
${indent}   </rect>
${indent}  </property>\n`;

    if (component.type === "PySideButton") {
        xml += `${indent}<widget class="QPushButton" name="${compName}">\n`;
        xml += `${indent}  <property name="text">
${indent}    <string>${component.text}</string>
${indent}  </property>\n`;
        xml += commonGeometry;
        xml += `${indent}  <property name="styleSheet">
${indent}    <string>
${indent}        QPushButton {
${indent}            color: rgba(${hexToRgba(component.textColor)});
${indent}            background-color: rgba(${hexToRgba(
            component.backgroundColor
        )});
${indent}            border-radius: ${component.radius}px;
${indent}            font-size: ${component.fontSize}px;
${indent}        }
${indent}        QPushButton:hover {
${indent}            background-color: rgba(${hexToRgba(component.hoverColor)});
${indent}        }
${indent}        QPushButton:pressed {
${indent}            background-color: rgba(${hexToRgba(
            component.pressedColor
        )});
${indent}        }
${indent}    </string>
${indent}  </property>\n`;
        // Buttons typically don't have children in Qt Designer structure
        xml += `${indent}</widget>\n`;
    } else if (component.type === "PySideLabel") {
        xml += `${indent}<widget class="QLabel" name="${compName}">\n`;
        xml += `${indent}  <property name="text">
${indent}    <string>${component.text}</string>
${indent}  </property>\n`;
        xml += commonGeometry;
        xml += `${indent}  <property name="styleSheet">
${indent}    <string>
${indent}        QLabel {
${indent}            color: rgba(${hexToRgba(component.textColor)});
${indent}            background-color: rgba(${hexToRgba(
            component.backgroundColor
        )});
${indent}            border-radius: ${component.radius}px;
${indent}            font-size: ${component.fontSize}px;
${indent}            border: 1px solid rgba(${hexToRgba(
            component.borderColor
        )});
${indent}        }
${indent}    </string>
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
${indent}        QSlider {
${indent}            background-color: rgba(${hexToRgba(
            component.backgroundColor
        )});
${indent}        }
${indent}        QSlider::groove:${
            component.orientation === "vertical" ? "vertical" : "horizontal"
        } {
${indent}            background: rgba(204, 204, 204, 1);
${indent}            ${
            component.orientation === "vertical"
                ? "width: 8px; margin: 0 2px;"
                : "height: 8px; margin: 2px 0;"
        }
${indent}        }
${indent}        QSlider::handle:${
            component.orientation === "vertical" ? "vertical" : "horizontal"
        } {
${indent}            background: rgba(${hexToRgba(component.sliderColor)});
${indent}            border: 1px solid rgba(92, 92, 92, 1);
${indent}            width: 16px;
${indent}            height: 16px;
${indent}            margin: -4px 0;
${indent}            border-radius: 8px;
${indent}        }
${indent}    </string>
${indent}  </property>\n`;
        xml += `${indent}</widget>\n`;
    } else if (component.type === "PySideFrame") {
        xml += `${indent}<widget class="QFrame" name="${compName}">\n`;
        xml += commonGeometry;
        xml += `${indent}  <property name="styleSheet">
${indent}      <string>background-color: rgba(${hexToRgba(
            component.backgroundColor
        )});</string>
${indent}  </property>\n`;
        xml += `${indent}  <property name="frameShape">
${indent}      <enum>QFrame::${component.frameShape}</enum>
${indent}  </property>\n`;
        xml += `${indent}  <property name="frameShadow">
${indent}      <enum>QFrame::${component.frameShadow}</enum>
${indent}  </property>\n`;
        xml += `${indent}  <property name="lineWidth">
${indent}      <number>${component.lineWidth}</number>
${indent}  </property>\n`;
        xml += `${indent}  <property name="midLineWidth">
${indent}      <number>${component.midLineWidth}</number>
${indent}  </property>\n`;

        // Find and log children
        const children = allComponents.filter(
            (comp) => comp.parentId === component.id
        );
        console.log(
            `${indent}  Frame ${compName} (ID: ${component.id}) - Found ${
                children.length
            } children: [${children
                .map((c) => `ID=${c.id}, Type=${c.type}`)
                .join(", ")}]`
        );

        // Recursively generate children's XML
        let childrenXml = "";
        children.forEach((child) => {
            childrenXml += generateComponentXml(
                child,
                allComponents,
                indentLevel + 1
            );
        });

        // Append children XML *before* the closing tag
        if (childrenXml) {
            xml += childrenXml;
        }

        // Add the closing tag for the frame
        xml += `${indent}</widget>\n`;
    }

    return xml;
};

export const generateQtUiFile = (screens, currentScreenIndex) => {
    console.log("--- Starting UI File Generation ---");
    let uiCode = `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>MainWindow</class>
 <widget class="QMainWindow" name="MainWindow">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>${screens[currentScreenIndex].width || 1280}</width>
    <height>${screens[currentScreenIndex].height || 800}</height>
   </rect>
  </property>
  <widget class="QStackedWidget" name="stackedWidget">
`;

    screens.forEach((screen, screenIndex) => {
        const screenId = screen.customId || `screen_${screenIndex}`;
        const allComponents = screen.components;
        const topLevelComponents = allComponents.filter(
            (comp) => comp.parentId === null
        );

        console.log(
            `Screen ${screenIndex} (${screenId}): Processing ${allComponents.length} total components.`
        );
        // Optional: Log all components for the screen if needed for deep debugging
        // console.log(JSON.stringify(allComponents, null, 2));

        uiCode += `   <widget class="QWidget" name="${screenId}">
    <property name="styleSheet">
      <string>background-color: rgba(${hexToRgba(
          screen.backgroundColor
      )});</string>
    </property>\n`; // Added newline for clarity

        // Generate XML for top-level components and their children recursively
        topLevelComponents.forEach((component) => {
            uiCode += generateComponentXml(component, allComponents, 2); // Start indent level at 2
        });

        uiCode += `   </widget>\n`; // Added newline
    });
    uiCode += `  </widget>
 </widget>
 <resources/>
 <connections/>
</ui>
`;
    console.log("--- Finished UI File Generation ---");
    return uiCode;
};
