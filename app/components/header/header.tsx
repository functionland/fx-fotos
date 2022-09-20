import React from 'react'
import { Header as HeaderRNE, HeaderProps } from '@rneui/themed'
import Animation, { AnimateProps } from 'react-native-reanimated'

class HeaderComponent extends React.Component<HeaderProps> {
  constructor(props) {
    super(props)
  }

  render() {
    return <HeaderRNE {...this.props} />
  }
}
const AnimatedHeader = Animation.createAnimatedComponent(HeaderComponent)
/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
export type Props = AnimateProps<HeaderProps>
export function Header(props: Props) {
  return <AnimatedHeader {...props} />
}
