import React from "react";
import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle } from "@drizzle/store";
import drizzleOptions from "./drizzleOptions";
import MyComponent from "./Drizzle";
import { Loading } from "../utils";

const drizzle = new Drizzle(drizzleOptions);

const Eth = () => {
  if (typeof window === 'undefined') return null

  return (
    <DrizzleContext.Provider drizzle={drizzle}>
      <DrizzleContext.Consumer>
        {drizzleContext => {
          const { drizzle, drizzleState, initialized } = drizzleContext;

          if (!initialized) {
            return <Loading message='Connecting to Ethereum...' />
          }

          return <MyComponent drizzle={drizzle} drizzleState={drizzleState} />
        }}
      </DrizzleContext.Consumer>
    </DrizzleContext.Provider>
  );
}

export default Eth;
