export const generatePySideCode = (
  components,
  backgroundColor,
  centerPanelDimensions
) => {
  const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  let pyCode = `
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QLabel, QPushButton
from PySide6.QtCore import QRect

class MyWindow(QMainWindow):
  def __init__(self):
      super().__init__()

      self.setWindowTitle("Generated UI")
      self.setGeometry(100, 100, ${centerPanelDimensions.width}, ${
    centerPanelDimensions.height
  })

      central_widget = QWidget(self)
      self.setCentralWidget(central_widget)
      central_widget.setStyleSheet("background-color: rgb(${hexToRgb(
        backgroundColor
      )});")

`;

  components.forEach((component, index) => {
    const componentName = `${component.type}${index}`;

    if (component.type === "PySideButton") {
      pyCode += `
      self.${componentName} = QPushButton("${component.text}", central_widget)
      self.${componentName}.setGeometry(QRect(${component.x}, ${component.y}, ${
        component.width
      }, ${component.height}))
      self.${componentName}.setStyleSheet("""
          color: rgb(${hexToRgb(component.textColor)});
          background-color: rgb(${hexToRgb(component.backgroundColor)});
          border-radius: ${component.radius}px;
          font-size: ${component.fontSize}px;
          /* Hover and Pressed Styles */
          &:hover {{
              background-color: rgb(${hexToRgb(component.hoverColor)});
          }}
          &:pressed {{
              background-color: rgb(${hexToRgb(component.pressedColor)});
          }}
      """)
`;
    } else if (component.type === "PySideLabel") {
      pyCode += `
      self.${componentName} = QLabel("${component.text}", central_widget)
      self.${componentName}.setGeometry(QRect(${component.x}, ${component.y}, ${
        component.width
      }, ${component.height}))
      self.${componentName}.setStyleSheet("""
          color: rgb(${hexToRgb(component.textColor)});
          background-color: rgb(${hexToRgb(component.backgroundColor)});
          border-radius: ${component.radius}px;
          font-size: ${component.fontSize}px;
          border: 1px solid #ccc;
      """)
`;
    }
  });

  pyCode += `
      self.show()

if __name__ == "__main__":
  app = QApplication([])
  window = MyWindow()
  app.exec()
`;

  return pyCode;
};
