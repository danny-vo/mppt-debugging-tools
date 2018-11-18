import json
import sys

from flask import Flask
from flask_cors import CORS
from PyQt5.QtCore import QThread
from PyQt5.QtWidgets import QApplication

from gui.serialMonitorViewer import SerialMonitorInterface
from serialMonitor.serialMonitor import SerialMonitor

import gui.viewer_constants as vc

smv_app = None
flask_app = Flask(__name__)
CORS(flask_app)

@flask_app.route('/')
def index():
  return json.dumps(smv_app.get_data(vc.VOLTAGE_IN))

@flask_app.route('/get_data/<var>', methods=['GET'])
def get_data(var):
  return json.dumps(smv_app.get_data(var))

class FlaskThread(QThread):
  def __init__(self, application):
    QThread.__init__(self)
    self.application = application

  def __del__(self):
    self.wait()

  def run(self):
    self.application.run(debug=False)

def init_gui(serialMonitor):
  # Initialize QtApp and Flask app
  app = QApplication(sys.argv)
  webapp = FlaskThread(flask_app)
  webapp.start()

  # Assign the serialMonitor library
  global smv_app
  smv_app = SerialMonitorInterface()
  smv_app.assignMonitor(serialMonitor)
  return app.exec()

def main():
  comPort = "/dev/ttyACM0"
  serialMonitor = SerialMonitor(comPort)
  sys.exit(init_gui(serialMonitor))

if __name__ == "__main__":
  main()
