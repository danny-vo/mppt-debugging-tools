import React, { Component } from 'react';
import Ring from 'ringjs';
import './App.css';

import {
  TimeRange,
  TimeSeries,
  TimeEvent,
} from 'pondjs';

import {
  Charts,
  ChartContainer,
  ChartRow,
  Legend,
  LineChart,
  ScatterChart,
  styler,
  YAxis
} from 'react-timeseries-charts';
import Resizable from 'react-timeseries-charts/lib/components/Resizable';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

const VOLTAGE_IN = "Voltage In";
const VOLTAGE_OUT = "Voltage Out";
const CURRENT_IN = "Current In";
const CURRENT_OUT = "Current Out";
const POWER_IN = "Power In";
const POWER_OUT = "Power Out";
const DUTY_CYCLE = "Duty Cycle";

const REST_URL = "http://localhost:5000/";
const GET_DATA = "get_data/";

const START_TIME = new Date();

const style = styler([
  { key: VOLTAGE_IN, color: "#CA4040", width: 3 },
  { key: VOLTAGE_OUT, color: "#9467bd", width: 3 },
  { key: CURRENT_IN, color: "#987951", width: 3 },
  { key: CURRENT_OUT, color: "#68798e", width: 3 },
  { key: POWER_IN, color: "#3c1518", width: 3 },
  { key: POWER_OUT, color: "#d58936", width: 3 },
  { key: DUTY_CYCLE, color: "#FF69B4", width: 3}
]);

const axisStyle = {
  label: {
    fontWeight: 100,
    fontSize: 48,
    font: '"Goudy Bookletter 1911", sans-serif"'
  },
  values: {
    fontWeight: 100,
    fontSize: 48,
    font: '"Goudy Bookletter 1911", sans-serif"'
  },
};

class MPPT_Plots extends Component {
  state = {
    time: new Date(),
    events: new Ring(100),
    voltageIn: new Ring(50),
    voltageOut: new Ring(50),
    currentIn: new Ring(50),
    currentOut: new Ring(50),
    powerIn: new Ring(50),
    powerOut: new Ring(50),
    dutyCycle: new Ring(50)
  };

  getVarBuffer = (item) => {
    switch(item) {
      case VOLTAGE_IN:
        return this.state.voltageIn;
      
      case VOLTAGE_OUT:
        return this.state.voltageOut;

      case CURRENT_IN:
        return this.state.currentIn;

      case CURRENT_OUT:
        return this.state.currentOut;

      case POWER_IN:
        return this.state.powerIn;

      case POWER_OUT:
        return this.state.powerOut;

      case DUTY_CYCLE:
        return this.state.dutyCycle;
      
      default:
        return null;
    }
  };

  updateVarBuffer = (buffer, date, item) => {
    const currentDate = this.state.time;
    date = date.getTime() > currentDate.getTime() ? date : currentDate;

    switch(item) {
      case VOLTAGE_IN:
        this.setState({
          time: date,
          voltageIn: buffer
        });
        break;

      case VOLTAGE_OUT:
        this.setState({
          time: date,
          voltageOut: buffer
        });
        break;

      case CURRENT_IN:
        this.setState({
          time: date,
          currentIn: buffer
        });
        break;

      case CURRENT_OUT:
        this.setState({
          time: date,
          currentOut: buffer
        });
        break;

      case POWER_IN:
        this.setState({
          time: date,
          powerIn: buffer
        });
        break;

      case POWER_OUT:
        this.setState({
          time: date,
          powerOut: buffer
        });
        break;

      case DUTY_CYCLE:
        this.setState({
          time: date,
          dutyCycle: buffer
        });
      
      default:
        return null;
    }
  };

  /**
   * Function:  updateState
   * ----------------------
   * Processes the response from the REST api and updates the event buffers
   * 
   * data: REST api response for GET get_data
   * 
   * returns: none
   */
  updateState = (data, item) => {
    const timeArr = data.time;
    const valsArr = data.vals;
    const eventsBuffer = this.getVarBuffer(item);

    for (let i=0; i < timeArr.length; ++i) {
      let date = new Date(timeArr[i] * 1000);
      let valObj = Object()
      valObj[item] = valsArr[i]
      let newEvent = new TimeEvent(
        date,
        valObj
      );

      eventsBuffer.push(newEvent);

      if (i+1 === timeArr.length) {
        this.updateVarBuffer(
          eventsBuffer,
          date,
          item
        )
      }
    }
  };

  /** 
   * Function:  getNewData
   * --------------------- 
   * Retrieves data from the REST api and calls updateState
   * 
   * item: variable to retrieve data for
   * 
   * returns: none
   */
  getNewData = (item) => {
    fetch(REST_URL + GET_DATA + item, {
      mode: 'cors',
      method: 'GET'
    }).then(res => res.json()).then(
      (response) => {
        this.updateState(response, item);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  componentDidMount() {
    /* Periodically poll rest end point for data */
    this.interval = setInterval(() => {
      this.getNewData(VOLTAGE_IN);
      this.getNewData(VOLTAGE_OUT);
      this.getNewData(CURRENT_IN);
      this.getNewData(CURRENT_OUT);
      this.getNewData(POWER_IN);
      this.getNewData(POWER_OUT);
      this.getNewData(DUTY_CYCLE);
    }, 3*second);
  }
  render() {
    const tr = new TimeRange(START_TIME, this.state.time);
    const voltageInSeries = new TimeSeries({
      name: "Voltage In",
      events: this.state.voltageIn.toArray()
    });
    const voltageOutSeries = new TimeSeries({
      name: "Voltage Out",
      events: this.state.voltageOut.toArray()
    });
    const currentInSeries = new TimeSeries({
      name: "Current In",
      events: this.state.currentIn.toArray()
    });
    const currentOutSeries = new TimeSeries({
      name: "Current Out",
      events: this.state.currentOut.toArray()
    });
    const powerInSeries = new TimeSeries({
      name: "Power In",
      events: this.state.powerIn.toArray()
    });
    const powerOutSeries = new TimeSeries({
      name: "Power Out",
      events: this.state.powerOut.toArray()
    });
    const dutyCycleSeries = new TimeSeries({
      name: "Duty Cycle",
      events: this.state.dutyCycle.toArray()
    });

    const voltageMin = Math.min(
      voltageInSeries.min(VOLTAGE_IN) !== undefined ? voltageInSeries.max(VOLTAGE_IN) : 0,
      voltageOutSeries.min(VOLTAGE_OUT) !== undefined ? voltageOutSeries.max(VOLTAGE_OUT) : 0
    );
    const voltageMax = Math.max(
      voltageInSeries.max(VOLTAGE_IN) !== undefined ? voltageInSeries.max(VOLTAGE_IN) : 0,
      voltageOutSeries.max(VOLTAGE_OUT) !== undefined ? voltageOutSeries.max(VOLTAGE_OUT) : 0
    );
    const currentMin = Math.min(
      currentInSeries.min(CURRENT_IN) !== undefined ? currentInSeries.max(CURRENT_IN) : 0,
      currentOutSeries.min(CURRENT_OUT) !== undefined ? currentOutSeries.max(CURRENT_OUT) : 0
    );
    const currentMax = Math.max(
      currentInSeries.max(CURRENT_IN) !== undefined ? currentInSeries.max(CURRENT_IN) : 0,
      currentOutSeries.max(CURRENT_OUT) !== undefined ? currentOutSeries.max(CURRENT_OUT) : 0
    );
    const powerMin = Math.min(
      powerInSeries.min(POWER_IN) !== undefined ? powerInSeries.max(POWER_IN) : 0,
      powerOutSeries.min(POWER_OUT) !== undefined ? powerOutSeries.max(POWER_OUT) : 0
    );
    const powerMax = Math.max(
      powerInSeries.max(POWER_IN) !== undefined ? powerInSeries.max(POWER_IN) : 0,
      powerOutSeries.max(POWER_OUT) !== undefined ? powerOutSeries.max(POWER_OUT) : 0
    );

    const dutyCycleMin = dutyCycleSeries.min(DUTY_CYCLE);
    const dutyCycleMax = dutyCycleSeries.max(DUTY_CYCLE);

    return (
      <div>
        <div className="col-md-2">
          <Legend
            type="line"
            align="right"
            stack={false}
            style={style}
            symbolwidth={28}
            symbolheight={28}
            categories={[
              { key: VOLTAGE_IN, label: VOLTAGE_IN },
              { key: VOLTAGE_OUT, label: VOLTAGE_OUT },
              { key: CURRENT_IN, label: CURRENT_IN },
              { key: CURRENT_OUT, label: CURRENT_OUT },
              { key: POWER_IN, label: POWER_IN },
              { key: POWER_OUT, label: POWER_OUT }
            ]}
          />
        </div>
        <div classname="row">
          <div className="col-md-10">
            <Resizable>
              <ChartContainer
                title="MPPT Plots"
                titleHeight={80}
                titleStyle ={{
                  fontWeight: 100,
                  fontSize: 40,
                  font: '"Goudy Bookletter 1911", sans-serif"',
                  fill: "#cc5500"
                }}
                timeAxisStyle={axisStyle}
                timeRange={tr}
                showGrid={true}
                showGridPosition="under"
              >

                <ChartRow height="210">
                  <YAxis id="voltage" label="Voltage (V)" labelOffset={-5}
                    min={voltageMin-(.5*voltageMin)} max={voltageMax+(.5*voltageMax)}
                    type="linear" format=",.2f" width="100"
                    style={axisStyle}
                    />
                  <Charts>
                    <LineChart
                      axis="voltage"
                      series={voltageInSeries}
                      columns={["time", VOLTAGE_IN]}
                      style={style}
                    />
                    <ScatterChart
                      axis="voltage"
                      series={voltageInSeries}
                      columns={["time", VOLTAGE_IN]}
                      radius={4}
                    />
                    <LineChart
                      axis="voltage"
                      series={voltageOutSeries}
                      columns={["time", VOLTAGE_OUT]}
                      style={style}
                    />
                    <ScatterChart
                      axis="voltage"
                      series={voltageOutSeries}
                      columns={["time", VOLTAGE_OUT]}
                      radius={4}
                    />
                  </Charts>
                </ChartRow>

                <ChartRow height="210">
                  <YAxis id="current" label="Current (A)" labelOffset={-5}
                    min={currentMin-(.5*currentMin)} max={currentMax+(.5*currentMax)}
                    type="linear" format=",.2f" width="100"
                    style={axisStyle}
                    />
                  <Charts>
                    <LineChart
                      axis="current"
                      series={currentInSeries}
                      columns={["time", CURRENT_IN]}
                      style={style}
                    />
                    <ScatterChart
                      axis="current"
                      series={currentInSeries}
                      columns={["time", CURRENT_IN]}
                      radius={4}
                    />
                    <LineChart
                      axis="current"
                      series={currentOutSeries}
                      columns={["time", CURRENT_OUT]}
                      style={style}
                    />
                    <ScatterChart
                      axis="current"
                      series={currentOutSeries}
                      columns={["time", CURRENT_OUT]}
                      radius={4}
                    />
                  </Charts>
                </ChartRow>

                <ChartRow height="210">
                  <YAxis id="power" label="Power (W)" labelOffset={-5}
                    min={powerMin-(.5*powerMin)} max={powerMax+(.5*powerMax)}
                    type="linear" format=",.2f" width="100"
                    style={axisStyle}
                    />
                  <Charts>
                    <LineChart
                      axis="power"
                      series={powerInSeries}
                      columns={["time", POWER_IN]}
                      style={style}
                    />
                    <ScatterChart
                      axis="power"
                      series={powerInSeries}
                      columns={["time", POWER_IN]}
                      radius={4}
                    />
                    <LineChart
                      axis="power"
                      series={powerOutSeries}
                      columns={["time", POWER_OUT]}
                      style={style}
                    />
                    <ScatterChart
                      axis="power"
                      series={powerOutSeries}
                      columns={["time", POWER_OUT]}
                      radius={4}
                    />
                  </Charts>
                </ChartRow>
                <ChartRow height="210">
                  <YAxis id="duty_cycle" label="Duty Cycle (us)" labelOffset={-5}
                    min={dutyCycleMin-(.3*dutyCycleMin)} max={dutyCycleMax+(.3*dutyCycleMax)} type="linear" width="100"
                    format=",.2f"
                    style={axisStyle}
                    />
                  <Charts>
                    <LineChart
                      axis="duty_cycle"
                      series={dutyCycleSeries}
                      columns={["time", DUTY_CYCLE]}
                      style={style}
                    />
                    <ScatterChart
                      axis="duty_cycle"
                      series={dutyCycleSeries}
                      columns={["time", DUTY_CYCLE]}
                      radius={4}
                    />
                  </Charts>
                </ChartRow>

              </ChartContainer>
            </Resizable>
          </div>
        </div>
      </div>
    );
  }
}

export default MPPT_Plots;