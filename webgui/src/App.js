import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Charts, ChartContainer, ChartRow, LineChart, YAxis } from "react-timeseries-charts";

class MPPT_Plots extends Component {
  render() {
    return (
      <ChartContainer>

        <ChartRow>
          <YAxis id="voltage" label="Voltage (V)"/>
          <Charts>
            <LineChart
              axis="voltage"
            />
            <LineChart
              axis="voltage"
            />
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="current" label="Current (A)"/>
          <Charts>
            <LineChart
              axis="current"
            />
            <LineChart
              axis="current"
            />
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="power" label="Power (W)"/>
          <Charts>
            <LineChart
              axis="power"
            />
            <LineChart
              axis="power"
            />
          </Charts>
        </ChartRow>

        <ChartRow>
          <YAxis id="duty_cycle" label="Duty Cycle (%)"/>
          <Charts>
            <LineChart
              axis="duty_cycle"
            />
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