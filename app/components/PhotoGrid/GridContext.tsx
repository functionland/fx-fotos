import React, { useContext, useEffect, createContext, useState } from 'react';
import {
  useRecoilState,
} from 'recoil';
import { numColumnsState } from '../../store';
import Reanimated, {
  useAnimatedGestureHandler,
  Easing,
  useSharedValue,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';

type PossibleContext = { columns?: SharedValue<number>, setColumns?: Function, scale?: Reanimated.SharedValue<number> }

const GridContext: React.Context<PossibleContext> = createContext({} as PossibleContext);

export function useColumnsNumber() {
  const { columns, setColumns } = useContext(GridContext);
  return [columns, setColumns] as [SharedValue<number>, Function];
}

export function useScale() {
  const { scale } = useContext(GridContext);
  return scale as Reanimated.SharedValue<number>;
}

interface Props { }

const GridProvider: React.FC<Props> = (props) => {
  const [numColumns, setNumColumns] = useRecoilState(numColumnsState);
  const [columns1, setColumns] = useState(2);
  const columns = useSharedValue(3);
  const scale = useSharedValue(3);
  return (
    <GridContext.Provider value={{ columns, scale }}>
      {props.children}
    </GridContext.Provider>
  );

}

export default GridProvider;