import React, { FC, useEffect, useState } from "react"
import { StyleSheet, Text, Alert } from "react-native"
import * as MediaLibrary from "expo-media-library"
import { StackScreenProps, Header } from "@react-navigation/stack"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import {
    Screen,
} from "../../components"
import { AssetService } from "../../services"
import { NavigatorParamList } from "../../navigators"
import { color, spacing } from "../../theme"
import AssetList from "../../components/asset-list"
import { RecyclerAssetListSection, ViewType } from "../../types"
import { useFloatHederAnimation } from "../../utils/hooks"
export const HomeScreen: FC<BottomTabScreenProps<NavigatorParamList, "home">> =
    ({ navigation }) => {
        const [assets, setAssets] = useState<RecyclerAssetListSection[]>(null);
        const [isReady, setIsReady] = useState(false);
        const [mediaLibraryStatus] = MediaLibrary.usePermissions()

        // Get a custom hook to animate the header
        const [scrollY, headerStyles] = useFloatHederAnimation(60);
       
        useEffect(() => {
            navigation.setOptions({
                headerStyle: [{
                }, headerStyles]
            })
        }, []);
        const requestAndroidPermission = async () => {
            try {
                console.log("requestAndroidPermission")
                await MediaLibrary.requestPermissionsAsync(true);
            } catch (err) {
                Alert.alert("Request permission", JSON.stringify(err))
                console.warn(err);
            }finally{
                setIsReady(true);
            }
        };
        useEffect(() => {
            requestAndroidPermission();
        }, [])

        useEffect(() => {
            if (isReady)
                prepareAssets();

        }, [isReady])
        const prepareAssets = async () => {
            console.log("prepareAssets")
            try {
                const allMedias = await AssetService.getAllMedias();
                setAssets(AssetService.categorizeAssets(allMedias.assets));
            } catch (error) {
                console.error("prepareAssets:",error);
            }
        }
        return (
            <Screen
                scrollEventThrottle={16}
                automaticallyAdjustContentInsets
                style={styles.screen} backgroundColor={color.transparent}>
                {!assets ? (
                    <Text style={styles.loadingText}>Loading photos...</Text>
                ) : !assets?.length ?
                    <Text style={styles.emptyText}>Gallery is empty!</Text>
                    : <AssetList sections={assets} scrollY={scrollY} />}
            </Screen>
        )
    }

const styles = StyleSheet.create({
    emptyText: {
        alignSelf: "center",
        fontSize: 24,
        fontWeight: "800"
    },
    loadingText: {
        alignSelf: "center",
        fontSize: 24,
        fontWeight: "800",
        color: "gray"
    },
    screen: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f5f5f5"
    }
})

