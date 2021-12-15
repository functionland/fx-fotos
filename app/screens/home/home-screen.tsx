import React, { FC, useEffect, useState } from "react"
import { StyleSheet,ImageStyle, Platform, TextStyle, View, ViewStyle, Text,FlatList,Image } from "react-native"
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
        const [isReady, setIsReady] = useState(false);

        const [status, requestPermission] = MediaLibrary.usePermissions();
        const requestStoragePermission = async () => {
            try {
                const access = await requestPermission();
                console.log("requestStoragePermission",access)
                if (access.granted) {
                    setIsReady(true);
                }
            } catch (error) {
                console.log(error)
            }
            
        }
        useEffect(()=>{
            console.log("requestPermission");
            // requestPermission().then(status=>{
            //     console.log("status",status)
            // }).catch(error=>console.log(error));
            requestStoragePermission();
        },[])
        useEffect(() => {
            // if (status?.granted) {
            //     setIsReady(true);
            // }
        }, [status]);
        const loadAllMedia = async () => {
            try {
                const medias = await MediaLibrary.getAssetsAsync({
                    first: 5000,
                });
                console.log(medias?.assets?.length);
                setAssets(medias?.assets?.map(asset => ({
                    id:asset.id,
                    data: asset,
                    type: ViewType.ASSET
                }))||[]);
            } catch (error) {
                console.log("error",error)
            }
            

        };
        useEffect(() => {
            if(isReady)
             loadAllMedia();
        }, [isReady])
        return (
            <Screen style={{ flex: 1 }} preset="scroll" backgroundColor={color.transparent}>
                <AssetList sections={assets} />
            </Screen>
        )
    }
