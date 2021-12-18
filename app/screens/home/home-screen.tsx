import React, { FC, useEffect, useState } from "react"
import { StyleSheet, Text, PermissionsAndroid, Alert } from "react-native"

import { StackScreenProps } from "@react-navigation/stack"
import {
    Screen,
} from "../../components"
import { AssetService } from "../../services"
import { NavigatorParamList } from "../../navigators"
import { color, spacing } from "../../theme"
import AssetList from "../../components/asset-list"
import { RecyclerAssetListSection, ViewType } from "../../types"
export const HomeScreen: FC<StackScreenProps<NavigatorParamList, "home">> =
    ({ navigation }) => {
        const [assets, setAssets] = useState<RecyclerAssetListSection[]>(null);
        const [isReady, setIsReady] = useState(false);
        const requestAndroidPermission = async () => {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: "Photos App Permission",
                        message:
                            "Photos App needs access to your storage ",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setIsReady(true);
                    console.log("You can use the storage");
                } else {
                    Alert.alert("Storage permission denied",)
                    console.log("Storage permission denied");
                }
            } catch (err) {
                Alert.alert("Request permission", JSON.stringify(err))
                console.warn(err);
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
            try {
                const allMedias = await AssetService.getAllMedias();
                setAssets(AssetService.categorizeAssets(allMedias.assets));
            } catch (error) {
                console.error(error);
            }
        }
        return (
            <Screen style={styles.screen} preset="scroll" backgroundColor={color.transparent}>
                {!assets ? (
                    <Text style={styles.loadingText}>Loading photos...</Text>
                ) : !assets?.length ?
                    <Text style={styles.emptyText}>Gallery is empty!</Text>
                    : <AssetList sections={assets} />}
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
        fontWeight: "800"
    },
    screen: {
        flex: 1,
        justifyContent: "center"
    }
})

