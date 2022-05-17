import React, { useEffect, useState, } from "react"
import { StyleSheet, View, ListRenderItemInfo, Pressable, Image } from "react-native"
import { useRecoilState } from "recoil"
import { Icon, Text, useTheme } from "@rneui/themed"

import { Screen } from "../../components"
import { AssetService } from "../../services"
import { Library } from "../../types"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeNavigationParamList, HomeNavigationTypes } from "../../navigators/home-navigator"
import { mediasState, selectedLibraryState } from "../../store"
import { Header } from "../../components/header"
import { Constants } from "../../theme"
import { FlatList } from "react-native-gesture-handler"
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated"
import { useFloatHederAnimation } from "../../utils/hooks"
import { AppNavigationNames } from "../../navigators"
interface HomeScreenProps {
  navigation: NativeStackNavigationProp<HomeNavigationParamList, HomeNavigationTypes>
}
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
export const LibraryScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [medias] = useRecoilState(mediasState)
  const [, setSelectedLibrary] = useRecoilState(selectedLibraryState)
  const { theme } = useTheme();
  const [libraies, setLibraries] = useState<Library[]>(null)
  // Get a custom hook to animate the header
  const [scrollY, headerStyles] = useFloatHederAnimation(60)
  useEffect(() => {
    setLibraries(AssetService.getLibraries(medias))
  }, [medias]);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (scrollY) scrollY.value = event.contentOffset.y
    },
  })
  const renderHeader = () => {
    return (<Header
      style={headerStyles}
      centerComponent={<Image
        style={styles.logo}
        fadeDuration={0}
        resizeMode="contain"
        source={require("../../../assets/images/logo.png")}
      />}
    />)
  }
  
  const onLibraryPress = (item: Library) => {
    setSelectedLibrary(item);
    navigation.push(AppNavigationNames.LibraryAssets)
  }

  const renderItem = (info: ListRenderItemInfo<Library>) => {
    return <View style={styles.card}>
      <Pressable
        android_ripple={{ color: theme.colors.background, foreground: true }}
        onPress={() => onLibraryPress(info.item)}
      >
        <Image
          style={styles.cardImage}
          source={{ uri: info.item?.assets?.[0]?.uri }}
          resizeMode="cover"
        />
      </Pressable>
      <Text>{info.item.title}</Text>
    </View>
  }
  return (
    <Screen
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets
      style={styles.screen}
    >
      {renderHeader()}
      {libraies && <AnimatedFlatList
        contentContainerStyle={styles.listContainer}
        style={{ flex: 1 }}
        data={libraies}
        numColumns={2}
        renderItem={renderItem}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
      />}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
  },
  listContainer: {
    paddingTop: Constants.HeaderHeight,
    paddingHorizontal: 5
  },
  headerLeftContainer: {
    flex: 1,
    flexDirection: "row",
    paddingStart: 5
  },
  headerRightContainer: {
    flex: 1,
    flexDirection: "row",
    paddingEnd: 5
  },
  selectModeHeader: {
    transform: [{
      translateY: 0
    }]
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
  },
  subheaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    height: 30,
    alignSelf: "center",
    backgroundColor: "transparent"
  },
  card: {
    flex: 1,
    padding: 10
  },
  cardImage: {
    aspectRatio: 1,
    width: '100%',
    flex: 1,
    marginBottom: 8,
    borderRadius: 15
  },
})