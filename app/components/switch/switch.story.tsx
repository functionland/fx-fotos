import * as React from 'react'
import { View, ViewStyle } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { useToggle } from 'react-use'
import { StoryScreen, Story, UseCase } from '../../../storybook/views'
import { Switch } from './switch'

declare let module

const styleArray: ViewStyle[] = [{ borderColor: '#686868' }]

const trackOffStyle: ViewStyle[] = [
  { backgroundColor: '#686868' },
  {
    height: 80,
    borderRadius: 0,
  },
]
const trackOnStyle: ViewStyle[] = [
  {
    backgroundColor: '#b1008e',
    borderColor: '#686868',
  },
  {
    height: 80,
    borderRadius: 0,
  },
]
const thumbOffStyle: ViewStyle[] = [
  {
    backgroundColor: '#b1008e',
    borderColor: '#686868',
  },
  {
    height: 80,
    borderRadius: 0,
  },
]
const thumbOnStyle: ViewStyle[] = [
  { backgroundColor: '#f0c' },
  {
    height: 80,
    borderRadius: 0,
    borderColor: '#686868',
  },
]

storiesOf('Switch', module)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add('Behaviour', () => (
    <Story>
      <UseCase
        text="The Toggle Switch"
        usage="Use the switch to represent on/off states."
      >
        <View>
          {(() => {
            const [on, toggle] = useToggle(false);
            return <Switch value={on} onToggle={toggle} />;
          })()}
        </View>
      </UseCase>
      <UseCase text="value = true" usage="This is permanently on.">
        <Switch value />
      </UseCase>
      <UseCase text="value = false" usage="This is permanently off.">
        <Switch value={false} />
      </UseCase>
    </Story>
  ))
  .add('Styling', () => (
    <Story>
      <UseCase text="Custom Styling" usage="Promise me this won't happen.">
        <View>
          {(() => {
            const [on, toggle] = useToggle(false)
            return (
              <Switch
                trackOnStyle={{
                  backgroundColor: 'green',
                  borderColor: 'black',
                }}
                trackOffStyle={{
                  backgroundColor: 'red',
                  borderColor: 'maroon',
                }}
                thumbOnStyle={{
                  backgroundColor: 'cyan',
                }}
                thumbOffStyle={{
                  backgroundColor: 'pink',
                }}
                value={on}
                onToggle={toggle}
              />
            )
          })()}
        </View>
      </UseCase>

      <UseCase text="Style array" usage="This either.">
        <View>
          {(() => {
            const [on, toggle] = useToggle(false)
            return (
              <Switch
                style={styleArray}
                trackOffStyle={trackOffStyle}
                trackOnStyle={trackOnStyle}
                thumbOffStyle={thumbOffStyle}
                thumbOnStyle={thumbOnStyle}
                value={on}
                onToggle={toggle}
              />
            )
          })()}
        </View>
      </UseCase>
    </Story>
  ))
