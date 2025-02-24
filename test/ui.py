
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QLabel, QPushButton, QStackedWidget
from PySide6.QtCore import QRect, QPropertyAnimation, QEasingCurve, QPoint
from PySide6.QtGui import QColor


class MyWindow(QMainWindow):
  def __init__(self):
      super().__init__()

      self.setWindowTitle("Generated UI")
      self.setGeometry(100, 100, 1528, 1154)

      self.stacked_widget = QStackedWidget(self)
      self.setCentralWidget(self.stacked_widget)


      # --- Screen 1 ---
      self.screen_0_widget = QWidget()
      self.screen_0_widget.setStyleSheet("background-color: rgb(255, 255, 255);")

      self.PySideButton0_screen0 = QPushButton("Button 0", self.screen_0_widget)
      self.PySideButton0_screen0.setGeometry(QRect(50, 50, 200, 100))
      self.PySideButton0_screen0.setStyleSheet("""
          QPushButton {
              color: rgb(255, 255, 255);
              background-color: rgb(59, 130, 246);
              border-radius: 4px;
              font-size: 16px;
          }
          QPushButton:hover {
              background-color: rgb(96, 165, 250);
          }
          QPushButton:pressed {
              background-color: rgb(29, 78, 216);
          }
      """)

      self.PySideLabel1_screen0 = QLabel("Label 1", self.screen_0_widget)
      self.PySideLabel1_screen0.setGeometry(QRect(294, 56, 150, 50))
      self.PySideLabel1_screen0.setStyleSheet("""
          QLabel {
              color: rgb(0, 0, 0);
              background-color: rgb(240, 240, 240);
              border-radius: 0px;
              font-size: 14px;
              border: 1px solid #ccc;
          }
      """)

      self.stacked_widget.addWidget(self.screen_0_widget)

      # --- Screen 2 ---
      self.screen_1_widget = QWidget()
      self.screen_1_widget.setStyleSheet("background-color: rgb(255, 255, 255);")

      self.PySideButton0_screen1 = QPushButton("Button 2", self.screen_1_widget)
      self.PySideButton0_screen1.setGeometry(QRect(50, 50, 200, 100))
      self.PySideButton0_screen1.setStyleSheet("""
          QPushButton {
              color: rgb(255, 255, 255);
              background-color: rgb(59, 130, 246);
              border-radius: 4px;
              font-size: 16px;
          }
          QPushButton:hover {
              background-color: rgb(96, 165, 250);
          }
          QPushButton:pressed {
              background-color: rgb(29, 78, 216);
          }
      """)

      self.PySideLabel1_screen1 = QLabel("Label 3", self.screen_1_widget)
      self.PySideLabel1_screen1.setGeometry(QRect(294, 79, 150, 50))
      self.PySideLabel1_screen1.setStyleSheet("""
          QLabel {
              color: rgb(0, 0, 0);
              background-color: rgb(240, 240, 240);
              border-radius: 0px;
              font-size: 14px;
              border: 1px solid #ccc;
          }
      """)

      self.stacked_widget.addWidget(self.screen_1_widget)

      self.stacked_widget.setCurrentIndex(1)
      self.current_screen_index = 1

      # Animation setup
      self.animation = QPropertyAnimation(self, b"pos")
      self.animation.setDuration(500)
      self.animation.setEasingCurve(QEasingCurve.Type.InOutQuad)

  def switch_screen(self, index):
      if index == self.current_screen_index:
          return

      direction = 1 if index > self.current_screen_index else -1
      current_widget = self.stacked_widget.currentWidget()
      next_widget = self.stacked_widget.widget(index)

      # Set initial position of the next widget (offscreen)
      next_widget.move(self.width() * direction, 0)
      current_widget.move(0,0)

      self.animation.setStartValue(QPoint(0, 0))
      self.animation.setEndValue(QPoint(-self.width() * direction, 0))


      self.animation.finished.connect(lambda: self.post_switch_screen(index))

      self.current_screen_index = index
      current_widget.stackUnder(next_widget)
      self.stacked_widget.setCurrentIndex(index) #show next screen
      self.animation.start()


  def post_switch_screen(self, index):
      self.stacked_widget.setCurrentIndex(index)  # Ensure correct index
      widget = self.stacked_widget.widget(index)
      widget.move(0,0) #fix position

      self.button_screen_0 = QPushButton("Go to Screen 1", self)
      self.button_screen_0.setGeometry(QRect(10, 10, 150, 30))
      self.button_screen_0.clicked.connect(lambda _, i=0: self.switch_screen(i))

      self.button_screen_1 = QPushButton("Go to Screen 2", self)
      self.button_screen_1.setGeometry(QRect(10, 50, 150, 30))
      self.button_screen_1.clicked.connect(lambda _, i=1: self.switch_screen(i))

      self.show()

if __name__ == "__main__":
  app = QApplication([])
  window = MyWindow()
  app.exec()
