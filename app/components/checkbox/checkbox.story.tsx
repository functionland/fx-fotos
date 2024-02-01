import * as React from 'react'
import { View, ViewStyle } from 'react-native'
import { storiesOf } from '@storybook/react-native'
import { useToggle } from 'react-use'
import { StoryScreen, Story, UseCase } from '../../../storybook/views'
import { Checkbox } from './checkbox'

const arrayStyle: ViewStyle[] = [
  { paddingVertical: 40 },
  { alignSelf: 'flex-end' },
]
const arrayOutlineStyle: ViewStyle[] = [
  { borderColor: '#b443c9' },
  { borderWidth: 25 },
]
const arrayFillStyle: ViewStyle[] = [{ backgroundColor: '#55e0ff' }]

storiesOf('Checkbox', module)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add('Styling', () => (
    <Story>
      <UseCase text="multiline = true" usage="For really really long text">
        <View>
          {(() => {
            const [on, toggle] = useToggle(false)
            return (
              <Checkbox
                text="We’re an App Design & Development Team. Experts in mobile & web technologies. We create beautiful, functional mobile apps and websites."
                value={on}
                multiline
                onToggle={toggle}
              />
            )
          })()}
        </View>
      </UseCase>
      <UseCase text=".style" usage="Override the container style">
        <View>
          {(() => {
            const [on, toggle] = useToggle(false)
            return (
              <Checkbox
                text="Hello there!"
                value={on}
                style={{
                  backgroundColor: 'purple',
                  marginLeft: 40,
                  paddingVertical: 30,
                  paddingLeft: 60,
                }}
                onToggle={toggle}
              />
            )
          })()}
        </View>
      </UseCase>
      <UseCase text=".outlineStyle" usage="Override the outline style">
        <View>
          {(() => {
            const [on, toggle] = useToggle(false)
            return (
              <Checkbox
                text="Outline is the box frame"
                value={on}
                outlineStyle={{
                  borderColor: 'green',
                  borderRadius: 10,
                  borderWidth: 4,
                  width: 60,
                  height: 20,
                }}
                onToggle={toggle}
              />
            )
          })()}
        </View>
      </UseCase>
      <UseCase text=".fillStyle" usage="Override the fill style">
        <View>
          {(() => {
            const [on, toggle] = useToggle(false)
            return (
              <Checkbox
                text="Fill er up"
                value={on}
                fillStyle={{
                  backgroundColor: 'red',
                  borderRadius: 8,
                }}
                onToggle={toggle}
              />
            )
          })()}
        </View>
      </UseCase>
      <UseCase text="Array style" usage="Use array styles">
        <View>
          {(() => {
            const [on, toggle] = useToggle(false)
            return (
              <Checkbox
                text="Check it twice"
                value={on}
                onToggle={toggle}
                style={arrayStyle}
                outlineStyle={arrayOutlineStyle}
                fillStyle={arrayFillStyle}
              />
            )
          })()}
        </View>
      </UseCase>
    </Story>
  ))
