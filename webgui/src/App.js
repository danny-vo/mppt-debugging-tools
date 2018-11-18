import React, { Component } from 'react';
import logo from './logo.svg';
import Ring from 'ringjs';
import './App.css';

import {
  Event,
  TimeRange,
  TimeSeries
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
const VOLTAGE_OUT = "Voltage Out"

class MPPT_Plots extends Component {
  state = {
    time: new Date(),
    events: new Ring(100)
  };

  getNewData = (item) => {
    const rest_url = "http://localhost:5000/";
    const get_data = "get_data/"

    fetch(rest_url + get_data + item, {
      mode: 'cors',
      method: 'GET'
    }).then(res => res.json()).then(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  componentDidMount() {
    this.interval = setInterval(() => {
      this.getNewData(VOLTAGE_IN);
      /*
      const t = new Date(this.state.time.getTime() + increment);
      const event = this.getNewEvent(t);

      // Raw events
      const newEvents = this.state.events;
      newEvents.push(event);
      this.setState({ time: t, events: newEvents });

      // Let our aggregators process the event
      this.stream.addEvent(event);
      */
    }, 3*second);
  }

  render() {
    const tr = new TimeRange(new Date(2015, 0, 1), new Date(2018, 0, 1));
    return (
      <ChartContainer timeRange={tr}>

        <ChartRow>
          <YAxis id="voltage" label="Voltage (V)"/>
          <Charts>
            {/*
            <LineChart
              axis="voltage"
            />
            <LineChart
              axis="voltage"
            />
            */}
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="current" label="Current (A)"/>
          <Charts>
            {/*}
            <LineChart
              axis="current"
            />
            <LineChart
              axis="current"
            />
          */}
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="power" label="Power (W)"/>
          <Charts>
          {/*}
            <LineChart
              axis="power"
            />
            <LineChart
              axis="power"
            />
          */}
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="duty_cycle" label="Duty Cycle (%)"/>
          <Charts>
          {/*}
            <LineChart
              axis="duty_cycle"
            />
          */}
          </Charts>
        </ChartRow>

      </ChartContainer>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default MPPT_Plots;