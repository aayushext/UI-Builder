export const generatePySideCode = (
  screens,
  currentScreenIndex,
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
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QLabel, QPushButton, QStackedWidget
from PySide6.QtCore import QRect, QPropertyAnimation, QEasingCurve, QPoint
from PySide6.QtGui import QColor


class MyWindow(QMainWindow):
  def __init__(self):
      super().__init__()

      self.setWindowTitle("Generated UI")
      self.setGeometry(100, 100, ${centerPanelDimensions.width}, ${centerPanelDimensions.height})

      self.stacked_widget = QStackedWidget(self)
      self.setCentralWidget(self.stacked_widget)

`;

  screens.forEach((screen, screenIndex) => {
    pyCode += `
      # --- ${screen.name} ---
      self.screen_${screenIndex}_widget = QWidget()
      self.screen_${screenIndex}_widget.setStyleSheet("background-color: rgb(${hexToRgb(
      screen.backgroundColor
    )});")
`;

    screen.components.forEach((component, componentIndex) => {
      const componentName = `${component.type}${componentIndex}_screen${screenIndex}`;

      if (component.type === "PySideButton") {
        pyCode += `
      self.${componentName} = QPushButton("${
          component.text
        }", self.screen_${screenIndex}_widget)
      self.${componentName}.setGeometry(QRect(${component.x}, ${component.y}, ${
          component.width
        }, ${component.height}))
      self.${componentName}.setStyleSheet("""
          QPushButton {
              color: rgb(${hexToRgb(component.textColor)});
              background-color: rgb(${hexToRgb(component.backgroundColor)});
              border-radius: ${component.radius}px;
              font-size: ${component.fontSize}px;
          }
          QPushButton:hover {
              background-color: rgb(${hexToRgb(component.hoverColor)});
          }
          QPushButton:pressed {
              background-color: rgb(${hexToRgb(component.pressedColor)});
          }
      """)
`;
      } else if (component.type === "PySideLabel") {
        pyCode += `
      self.${componentName} = QLabel("${
          component.text
        }", self.screen_${screenIndex}_widget)
      self.${componentName}.setGeometry(QRect(${component.x}, ${component.y}, ${
          component.width
        }, ${component.height}))
      self.${componentName}.setStyleSheet("""
          QLabel {
              color: rgb(${hexToRgb(component.textColor)});
              background-color: rgb(${hexToRgb(component.backgroundColor)});
              border-radius: ${component.radius}px;
              font-size: ${component.fontSize}px;
              border: 1px solid #ccc;
          }
      """)
`;
      }
    });

    pyCode += `
      self.stacked_widget.addWidget(self.screen_${screenIndex}_widget)
`;
  });

  pyCode += `
      self.stacked_widget.setCurrentIndex(${currentScreenIndex})
      self.current_screen_index = ${currentScreenIndex}

      # Animation setup
      self.animation = QPropertyAnimation(self.stacked_widget, b"pos")
      self.animation.setDuration(500)
      self.animation.setEasingCurve(QEasingCurve.Type.InOutQuad)


  def switch_screen(self, index):
      if index == self.current_screen_index:
          return

      direction = 1 if index > self.current_screen_index else -1
      current_widget = self.stacked_widget.currentWidget()
      next_widget = self.stacked_widget.widget(index)

      next_widget.setGeometry(self.width() * direction, 0, self.width(), self.height())

      self.animation.setStartValue(QPoint(0, 0))
      self.animation.setEndValue(QPoint(-self.width() * direction, 0))

      self.animation.finished.connect(lambda: self.post_switch_screen(index))

      self.stacked_widget.setCurrentIndex(index)
      self.current_screen_index = index
      current_widget.stackUnder(next_widget)
      self.animation.start()


  def post_switch_screen(self, index):
      self.stacked_widget.setCurrentIndex(index)  # Ensure correct index
      current_widget = self.stacked_widget.widget(index)
      current_widget.setGeometry(0, 0, self.width(), self.height())
`;

  screens.forEach((screen, index) => {
    pyCode += `
      self.button_screen_${index} = QPushButton("Go to ${screen.name}", self)
      self.button_screen_${index}.setGeometry(QRect(10, ${
      10 + index * 40
    }, 150, 30))
      self.button_screen_${index}.clicked.connect(lambda _, i=${index}: self.switch_screen(i))
`;
  });

  pyCode += `
      self.show()

if __name__ == "__main__":
  app = QApplication([])
  window = MyWindow()
  window.show()
  app.exec()
`;

  return pyCode;
};
