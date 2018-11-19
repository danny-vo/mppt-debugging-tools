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
  LineChart,
  YAxis
} from 'react-timeseries-charts';

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
      let newEvent = new TimeEvent(
        date,
        {value: valsArr[i]}
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

  /** * Function:  getNewData * --------------------- * Retrieves data from the REST api and calls updateState
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

    return (
      <ChartContainer timeRange={tr}>

        <ChartRow>
          <YAxis id="voltage" label="Voltage (V)" min={0} max={140}/>
          <Charts>
            <LineChart
              axis="voltage"
              series={voltageInSeries}
              columns={["time", "value"]}
            />
            <LineChart
              axis="voltage"
              series={voltageOutSeries}
              columns={["time", "value"]}
            />
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="current" label="Current (A)" min={0} max={6}/>
          <Charts>
            <LineChart
              axis="current"
              series={currentInSeries}
              columns={["time", "value"]}
            />
            <LineChart
              axis="current"
              series={currentOutSeries}
              columns={["time", "value"]}
            />
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="power" label="Power (W)" min={0} max={840}/>
          <Charts>
            <LineChart
              axis="power"
              series={powerInSeries}
              columns={["time", "value"]}
            />
            <LineChart
              axis="power"
              series={powerOutSeries}
              columns={["time", "value"]}
            />
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="duty_cycle" label="Duty Cycle (%)" min={0} max={100}/>
          <Charts>
            <LineChart
              axis="duty_cycle"
              series={dutyCycleSeries}
              columns={["time", "value"]}
            />
          </Charts>
        </ChartRow>

      </ChartContainer>
    );
  }
}

export default MPPT_Plots;