import React, { FC, useEffect, useState } from "react"
import { ImageStyle, Platform, TextStyle, View, ViewStyle,Text } from "react-native"
import * as MediaLibrary from 'expo-media-library';

import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import {
    Screen,
} from "../../components"
import { NavigatorParamList } from "../../navigators"
import { color, spacing } from "../../theme"
import AssetList from "../../components/asset-list"
import { RecyclerAssetListSection, ViewType } from "../../types"
export const HomeScreen: FC<StackScreenProps<NavigatorParamList, "home">> =
    ({ navigation }) => {
        const [assets, setAssets] = useState<RecyclerAssetListSection[]>([]);
        const loadAllMedia = async () => {
            const medias = await MediaLibrary.getAssetsAsync({
                first: 5000,
            });
            console.log(medias?.assets?.length);
            setAssets(medias?.assets?.map(asset => ({
                data: asset,
                type: ViewType.ASSET
            })));

        };
        useEffect(() => {
            //loadAllMedia();
        }, [])
        return (
            <Screen style={{flex:1,backgroundColor:"red"}} preset="scroll" backgroundColor={color.transparent}>
                <Text>Home</Text>
                {/* <AssetList sections={assets} /> */}
            </Screen>
        )
    }
