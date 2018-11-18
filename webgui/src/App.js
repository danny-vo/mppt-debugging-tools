import React, { Component } from 'react';
import logo from './logo.svg';
import Ring from 'ringjs';
import './App.css';

import {
  Event,
  TimeRange,
  TimeSeries,
  TimeEvent,
  Stream
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

const REST_URL = "http://localhost:5000/";
const GET_DATA = "get_data/"

class MPPT_Plots extends Component {
  state = {
    time: new Date(),
    events: new Ring(100)
  };

  updateState = (data) => {
    console.log("updateState");
    const timeArr = data.time;
    const valsArr = data.vals;
    const eventsBuffer = this.state.events;

    console.log(timeArr);

    for (let i=0; i < timeArr.length; ++i) {
      console.log(new Date(timeArr[i]))
      const newEvent = new Event(
        new Date(timeArr[i]),
        valsArr[i]
      );
      console.log(newEvent);
      eventsBuffer.push(newEvent);
    }

    console.log(eventsBuffer);
  };

  getNewData = (item) => {
    fetch(REST_URL + GET_DATA + item, {
      mode: 'cors',
      method: 'GET'
    }).then(res => res.json()).then(
      (response) => {
        console.log(response);
        this.updateState(response);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  componentDidMount() {
    /* Setup Stream for pipelines */
    this.stream =  new Stream();
    
    /* Periodically poll rest end point for data */
    this.interval = setInterval(() => {
      this.getNewData(VOLTAGE_IN);
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

export default MPPT_Plots;