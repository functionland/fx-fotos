import React from "react"
import { TouchableHighlight, StyleSheet } from "react-native"
import { GroupHeader, RecyclerAssetListSection, ViewType } from "../../../../types"
import StoryListItem from "./story-list-item"
import AssetItem from "./asset-item"
import HeaderItem from "./header-item"

import { palette } from "../../../../theme/palette"
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
export default RecyclerSectionItem
