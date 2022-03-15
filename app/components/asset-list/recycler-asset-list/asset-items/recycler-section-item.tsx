import React, { memo } from "react"
import { TouchableHighlight, StyleSheet } from "react-native"
import { GroupHeader, RecyclerAssetListSection, ViewType } from "../../../../types"
import StoryListItem from "./story-list-item"
import AssetItem from "./asset-item"
import HeaderItem from "./header-item"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../../../navigators/HomeNavigation"
import { StackNavigationProp } from "@react-navigation/stack"
import { palette } from "../../../../theme/palette"
import { useNavigation } from '@react-navigation/native';
interface Props {
  section: RecyclerAssetListSection
  selectionMode: boolean
  selected: boolean
  onLongPress: (section: RecyclerAssetListSection) => void
  onPress: (section: RecyclerAssetListSection) => void
}
const getSectionByType = (
  section: RecyclerAssetListSection,
  selectionMode: boolean,
  selected: boolean,
) => {
  switch (section.type) {
    case ViewType.STORY: {
      return <StoryListItem stories={section.data} selectionMode={selectionMode} />
    }
    case ViewType.ASSET: {
      return <AssetItem asset={section.data} selectionMode={selectionMode} selected={selected} />
    }
    case ViewType.MONTH: {
      const groupHeader: GroupHeader = section.data
      return (
        <HeaderItem
          title={groupHeader.title}
          selectionMode={selectionMode}
          selected={selected}
          textStyle={styles.monthText}
        />
      )
    }
    case ViewType.DAY: {
      const groupHeader: GroupHeader = section.data
      return (
        <HeaderItem
          title={groupHeader.title}
          selectionMode={selectionMode}
          selected={selected}
          textStyle={styles.dayText}
        />
      )
    }

    default:
      return null
  }
}
const RecyclerSectionItem: React.FC<Props> = ({
  section,
  selectionMode,
  selected,
  onLongPress,
  onPress,
}) => {
  const navigation = useNavigation();

  const onPressItem = () => {
    if (onPress) {
      setTimeout(() => {
        onPress(section)
      }, 0)
    }
  }
  const onLongPressItem = () => {
    setTimeout(() => {
      onLongPress?.(section)
    }, 0)
  }

  return (
    <TouchableHighlight
      style={styles.container}
      underlayColor="transparent"
      onLongPress={onLongPressItem}
      onPress={() => {
        if (!selected && !selectionMode) {
          navigation.push(HomeNavigationTypes.PhotoScreen, { section: section })
        }
        onPressItem()
      }}
    >
      {getSectionByType(section, selectionMode, selected)}
    </TouchableHighlight>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayText: {
    color: palette.black,
    fontSize: 16,
    fontWeight: "400",
    padding: 5,
  },
  monthText: {
    color: palette.black,
    fontSize: 28,
    fontWeight: "300",
    padding: 10,
    // paddingTop: 50,
  },
})
const areEqual = (prev: Props, next: Props) => {
  return (
    prev?.section?.id === next?.section?.id &&
    prev?.selectionMode === next?.selectionMode &&
    prev?.selected === next?.selected
  )
}
export default memo(RecyclerSectionItem, areEqual)
