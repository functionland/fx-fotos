import React from "react"
import { TouchableHighlight, StyleSheet, NativeSyntheticEvent, ImageErrorEventData } from "react-native"
import { Asset, GroupHeader, RecyclerAssetListSection, SyncStatus, ViewType } from "../../../../types"
import StoryListItem from "./story-list-item"
import AssetItem from "./asset-item"
import HeaderItem from "./header-item"

interface Props {
  section: RecyclerAssetListSection
  selectionMode: boolean
  selected: boolean,
  onLongPress: (section: RecyclerAssetListSection) => void
  onPress: (section: RecyclerAssetListSection) => void
  onAssetLoadError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void
}
const getSectionByType = (
  section: RecyclerAssetListSection,
  selectionMode: boolean,
  selected: boolean,
  onAssetLoadError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void
) => {
  switch (section.type) {
    case ViewType.STORY: {
      return <StoryListItem stories={section.data} selectionMode={selectionMode} />
    }
    case ViewType.ASSET: {
      const data = section?.data as Asset
      return <AssetItem
        onError={onAssetLoadError}
        asset={section.data}
        selectionMode={selectionMode}
        selected={selected}
        isSynced={data.syncStatus === SyncStatus.SYNCED}
        isDeleted={section?.data?.isDeleted} />
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
  onAssetLoadError
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
      onPress={onPressItem}
    >
      {getSectionByType(section, selectionMode, selected, onAssetLoadError)}
    </TouchableHighlight>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "400",
    padding: 5,
  },
  monthText: {
    fontSize: 28,
    fontWeight: "300",
    padding: 10,
  },
})
export default RecyclerSectionItem
