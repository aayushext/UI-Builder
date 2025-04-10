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
        # Example: self.ui.myButton.clicked.connect(self.button_clicked)
    
    # Define your slot functions here
    # def button_clicked(self):
    #     print("Button clicked!")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    sys.exit(app.exec())
`;
};

export const generateQtUiFile = (
    screens,
    currentScreenIndex,
    centerPanelDimensions
) => {
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

        uiCode += `   <widget class="QWidget" name="${screenId}">
    <property name="styleSheet">
      <string>background-color: rgba(${hexToRgba(
          screen.backgroundColor
      )});</string>
    </property>
`;
        screen.components.forEach((component, componentIndex) => {
            const compName =
                component.componentId ||
                `${component.type}${componentIndex}_screen${screenIndex}`;

            if (component.type === "PySideButton") {
                uiCode += `    <widget class="QPushButton" name="${compName}">
      <property name="text">
        <string>${component.text}</string>
      </property>
      <property name="geometry">
        <rect>
          <x>${component.x}</x>
          <y>${component.y}</y>
          <width>${component.width}</width>
          <height>${component.height}</height>
        </rect>
      </property>
      <property name="styleSheet">
        <string>
            QPushButton {
                color: rgba(${hexToRgba(component.textColor)});
                background-color: rgba(${hexToRgba(component.backgroundColor)});
                border-radius: ${component.radius}px;
                font-size: ${component.fontSize}px;
            }
            QPushButton:hover {
                background-color: rgba(${hexToRgba(component.hoverColor)});
            }
            QPushButton:pressed {
                background-color: rgba(${hexToRgba(component.pressedColor)});
            }
        </string>
      </property>
    </widget>
`;
            } else if (component.type === "PySideLabel") {
                uiCode += `    <widget class="QLabel" name="${compName}">
      <property name="text">
        <string>${component.text}</string>
      </property>
      <property name="geometry">
        <rect>
          <x>${component.x}</x>
          <y>${component.y}</y>
          <width>${component.width}</width>
          <height>${component.height}</height>
        </rect>
      </property>
      <property name="styleSheet">
        <string>
            QLabel {
                color: rgba(${hexToRgba(component.textColor)});
                background-color: rgba(${hexToRgba(component.backgroundColor)});
                border-radius: ${component.radius}px;
                font-size: ${component.fontSize}px;
                border: 1px solid rgba(${hexToRgba(component.borderColor)});
            }
        </string>
      </property>
    </widget>
`;
            } else if (component.type === "PySideSlider") {
                const orientation =
                    component.orientation === "vertical"
                        ? "Qt::Orientation::Vertical"
                        : "Qt::Orientation::Horizontal";
                uiCode += `    <widget class="QSlider" name="${compName}">
      <property name="orientation">
        <enum>${orientation}</enum>
      </property>
      <property name="minimum">
        <number>${component.minimum}</number>
      </property>
      <property name="maximum">
        <number>${component.maximum}</number>
      </property>
      <property name="value">
        <number>${component.value}</number>
      </property>
      <property name="geometry">
        <rect>
          <x>${component.x}</x>
          <y>${component.y}</y>
          <width>${component.width}</width>
          <height>${component.height}</height>
        </rect>
      </property>
      <property name="styleSheet">
        <string>
            QSlider {
                background-color: rgba(${hexToRgba(component.backgroundColor)});
            }
            QSlider::groove:${
                component.orientation === "vertical" ? "vertical" : "horizontal"
            } {
                background: rgba(204, 204, 204, 1);
                ${
                    component.orientation === "vertical"
                        ? "width: 8px; margin: 0 2px;"
                        : "height: 8px; margin: 2px 0;"
                }
            }
            QSlider::handle:${
                component.orientation === "vertical" ? "vertical" : "horizontal"
            } {
                background: rgba(${hexToRgba(component.sliderColor)});
                border: 1px solid rgba(92, 92, 92, 1);
                width: 16px;
                height: 16px;
                margin: -4px 0;
                border-radius: 8px;
            }
        </string>
      </property>
    </widget>
`;
            }
        });
        uiCode += `   </widget>
`;
    });
    uiCode += `  </widget>
 </widget>
 <resources/>
 <connections/>
</ui>
`;
    return uiCode;
};
