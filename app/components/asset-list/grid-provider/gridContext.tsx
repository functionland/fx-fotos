import React, { useContext, createContext } from 'react'
import Reanimated, {
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated'

type PossibleContext = {
  columns?: SharedValue<number>
  setColumns?: Function
  scale?: Reanimated.SharedValue<number>
}

const GridContext: React.Context<PossibleContext> = createContext(
  {} as PossibleContext,
)

export function useColumnsNumber() {
  const { columns, setColumns } = useContext(GridContext)
  return [columns, setColumns] as [SharedValue<number>, Function]
}

export function useScale() {
  const { scale } = useContext(GridContext)
  return scale as unknown as Reanimated.SharedValue<boolean>
}
export function usePinching() {
  const { pinching } = useContext(GridContext)
  return pinching as Reanimated.SharedValue<number>
}
interface Props {}

const GridProvider: React.FC<Props> = props => {
  const columns = useSharedValue(3)
  const scale = useSharedValue(3)
  const pinching = useSharedValue(false)
  return (
    <GridContext.Provider
      value={{
        columns,
        scale,
        pinching,
      }}
    >
      {props.children}
    </GridContext.Provider>
  )
}

export default GridProvider
