import React from 'react'
import {
  TouchableHighlight,
  StyleSheet,
  NativeSyntheticEvent,
  ImageErrorEventData,
} from 'react-native'
import {
  Asset,
  AssetStory,
  GroupHeader,
  RecyclerAssetListSection,
  SyncStatus,
  ViewType,
} from '../../../../types'
import StoryListItem from './story-list-item'
import AssetItem from './asset-item'
import HeaderItem from './header-item'

interface Props {
  section: RecyclerAssetListSection
  selectionMode: boolean
  selected: boolean
  externalState?: Asset | undefined
  onLongPress: (section: RecyclerAssetListSection) => void
  onPress: (section: RecyclerAssetListSection) => void
  onStoryPress?: (story: AssetStory) => void
  onAssetLoadError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void
}
const getSectionByType = (
  section: RecyclerAssetListSection,
  selectionMode: boolean,
  selected: boolean,
  externalState?: Asset | undefined,
  onAssetLoadError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void,
  onStoryPress?: (story: AssetStory) => void,
) => {
  switch (section.type) {
    case ViewType.STORY: {
      const data = section?.data as AssetStory[]
      return (
        <StoryListItem
          stories={data}
          //selectionMode={selectionMode}
          onPress={onStoryPress}
        />
      )
    }
    case ViewType.ASSET: {
      const data = section?.data as Asset
      return (
        <AssetItem
          onError={onAssetLoadError}
          asset={data}
          selectionMode={selectionMode}
          selected={selected}
          isSynced={externalState?.syncStatus === SyncStatus.SYNCED}
          isDeleted={externalState?.isDeleted || data?.isDeleted }
        />
      )
    }
    case ViewType.MONTH: {
      const groupHeader = section.data as GroupHeader
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
      const groupHeader = section.data as GroupHeader
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
  externalState,
  onLongPress,
  onPress,
  onStoryPress,
  onAssetLoadError,
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
      {getSectionByType(
        section,
        selectionMode,
        selected,
        externalState,
        onAssetLoadError,
        onStoryPress,
      )}
    </TouchableHighlight>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '400',
    padding: 5,
  },
  monthText: {
    fontSize: 28,
    fontWeight: '300',
    padding: 10,
  },
})
export default RecyclerSectionItem
