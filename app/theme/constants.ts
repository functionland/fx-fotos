import { Dimensions } from "react-native"

export enum Constants {
  HeaderHeight = 60,
  TabBarHeight = 70,
  StoryWrapperHeight = (Dimensions.get("window").height * 20) / 100,
  StoryItemWidth = (Dimensions.get("window").width * 30) / 100,
}
