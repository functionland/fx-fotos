import { NavigationProp, RouteProp } from "@react-navigation/native"
import React from "react"
import { Animated, Image, StyleSheet } from "react-native"
import { widthPercentageToDP } from "react-native-responsive-screen"
import { SharedElement } from "react-navigation-shared-element"
import { useRecoilState } from "recoil"
import { Screen } from "../../components"
import { RootStackParamList } from "../../navigators"
import { singleAssetState } from "../../store"

interface ImageGalleryViewerScreenProps {
  navigation: NavigationProp<RootStackParamList>
  route: RouteProp<RootStackParamList, "ImageGalleryViewer">
}

export const ImageGalleryViewerScreen: React.FC<ImageGalleryViewerScreenProps> = ({
  navigation,
  route,
}) => {

  const [singleAsset, setSingleAsset] = useRecoilState(singleAssetState)
  const imageContainerStyle = {
    height: (widthPercentageToDP(100) * singleAsset?.height) / singleAsset?.width,
    width: widthPercentageToDP(100),
  }

  return (
    <Screen style={styles.screen}>
      <SharedElement style={imageContainerStyle} id={route.params.assetId}>
        <Image
          source={{ uri: singleAsset.uri }}
          fadeDuration={0}
          resizeMode="contain"
          style={styles.image}
        />
      </SharedElement>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
