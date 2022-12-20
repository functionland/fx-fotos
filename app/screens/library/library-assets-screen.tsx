import React from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { Icon, Text } from '@rneui/themed'
import { useRecoilState } from 'recoil'
import Animated from 'react-native-reanimated'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  HomeNavigationParamList,
  HomeNavigationTypes,
} from '../../navigators/home-navigator'
import {
  dIDCredentialsState,
  foldersSettingsState,
  selectedLibraryState,
} from '../../store'
import { AssetListScreen } from '../index'
import {
  Header,
  HeaderArrowBack,
  HeaderLeftContainer,
} from '../../components/header'
import { Screen } from '../../components'
import { LocalDbService, SyncService } from '../../services'

interface Props {
  navigation: NativeStackNavigationProp<
    HomeNavigationParamList,
    HomeNavigationTypes
  >
}

export const LibraryAssetsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedLibrary] = useRecoilState(selectedLibraryState)

  const [foldersSettingsObj, setFoldersSettingsObj] =
    useRecoilState(foldersSettingsState)
  const [dIDCredentials] = useRecoilState(dIDCredentialsState)

  const folderAutoBuckupChanged = async () => {
    const flag = foldersSettingsObj?.[selectedLibrary.title]
      ? !foldersSettingsObj?.[selectedLibrary.title]?.autoBackup
      : true
    const folders = await LocalDbService.FolderSettings.addOrUpdate([
      {
        name: selectedLibrary.title,
        autoBackup: flag,
      },
    ])
    setFoldersSettingsObj({
      ...foldersSettingsObj,
      [folders?.[0].name]: folders?.[0],
    })

    setTimeout(() => {
      // Update folder's contents sync status
      if (flag) {
        SyncService.setAutoBackupAssets([selectedLibrary.title])
      } else {
        SyncService.unSetAutoBackupAssets([selectedLibrary.title])
      }
    }, 0)
  }
  const renderHeader = (
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>,
  ) => (
    <Animated.View
      style={[
        { position: 'absolute', top: 0, zIndex: 99, width: '100%' },
        style,
      ]}
    >
      <Header
        containerStyle={{ position: 'relative' }}
        placement="left"
        centerComponent={
          <Text lineBreakMode="tail" h4>
            {selectedLibrary?.title}
          </Text>
        }
        rightComponent={
          <HeaderLeftContainer style={{ flex: 1 }}>
            {dIDCredentials?.password && (
              <Icon
                type="material-community"
                name={
                  foldersSettingsObj[selectedLibrary?.title]?.autoBackup
                    ? 'cloud-check'
                    : 'cloud-outline'
                }
                size={28}
                onPress={folderAutoBuckupChanged}
              />
            )}
          </HeaderLeftContainer>
        }
        leftComponent={<HeaderArrowBack navigation={navigation} />}
      />
    </Animated.View>
  )
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      <AssetListScreen
        navigation={navigation}
        medias={selectedLibrary?.assets}
        defaultHeader={renderHeader}
      />
    </Screen>
  )
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
})
