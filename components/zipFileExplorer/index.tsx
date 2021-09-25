import { useEffect, useState } from 'react';
import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { ZipEntry } from 'unzipit';
import * as mime from 'react-native-mime-types';
import { getFileNameWithExtention } from '../../utils/functions';
import { List, FAB, ActivityIndicator } from 'react-native-paper'
interface Props {
    zipEntry: { [key: string]: ZipEntry } | undefined,
    checkedAll: boolean,
    uploadFile?: (fileName: string) => Promise<'upload' | 'done' | 'error'>,
    onFinish?: () => void
}
const mimeToIconName = (mime: string) => {
    switch (mime) {
        case "image/png":
        case "image/jpeg":
        case "image/gif":
            return "image"
        case "application/json":
            return "code-json"
        case "text/html":
            return "language-html5"
        default:
            return "folder"
    }
}
const ZipFileExplorer = (props: Props) => {
    const [imageData, setImageData] = useState<string | null>(null)
    const [selectedItems, setselectedItems] = useState<{ [key: string]: boolean }>({})
    const [uploadingItems, setUploadingItems] = useState<{ [key: string]: 'upload' | 'done' | 'error' }>({})
    const [uploading, setUploading] = useState(false);
    const { zipEntry, checkedAll, uploadFile, onFinish } = props;

    console.log(Date.now() + ': ZipFileExplorer re-rendered', uploadingItems);
    const uploadFiles = async () => {
        //setUploadingItems({});
        console.log("uploadFiles:", uploadingItems)
        const items = Object.keys(selectedItems);
        for (let index = 0; index < items.length; index++) {
            const key = items[index];
            if (uploadingItems[key] != 'done' && uploadFile) {

                try {
                    setUploadingItems((s) => ({
                        ...s,
                        [key]: 'upload'
                    }));
                    await uploadFile(key);
                    setUploadingItems((s) => ({
                        ...s,
                        [key]: 'done'
                    }));
                } catch (error) {
                    setUploadingItems((s) => ({
                        ...s,
                        [key]: 'error'
                    }));
                }

            }
        }
        setUploading(false);
        onFinish && onFinish();

    }
    const onSelectedItem = (key: string) => {
        console.log("onSelectFile", { key, selectedItems })
        setTimeout(() => {
            if (selectedItems[key]) {
                const items = { ...selectedItems }
                delete items[key];
                setselectedItems(items)
                return;

            }
            setselectedItems({
                ...selectedItems,
                [key]: true
            })
        }, 0);


        // if (!zipEntry)
        //     return
        // const picData = await zipEntry[key].arrayBuffer();
        // const base64Data = btoa(String.fromCharCode(...new Uint8Array(picData)))
        // setImageData(base64Data);
        // //const blob = await zipEntry[selected].blob('image/png');
        // console.log("base64Data:", base64Data);
        //console.log("blob:", blob)
    };
    useEffect(() => {
        if (checkedAll) {
            const allItems = Object.keys(zipEntry || {}).reduce((obj, key, index) => {
                return {
                    ...obj,
                    [key]: true
                }
            }, {});
            setselectedItems(allItems)
        } else
            setselectedItems({});

    }, [checkedAll])
    return (
        <View style={styles.container}>
            <ScrollView style={{ paddingBottom: 60 }}>
                {/* {imageData && <Image style={{
            width: "100%",
            height: 300,
            borderColor: "gray",
            borderWidth: 1

        }} source={{ uri: `data:image/png;base64,${imageData}` }} />} */}
                {
                    zipEntry && Object.keys(zipEntry).map((key, index) => {
                        const entry: ZipEntry = zipEntry[key];
                        const filename = getFileNameWithExtention(entry.name);
                        const mome = mime.lookup(entry.name)

                        return (
                            <List.Item
                                key={index}
                                onPress={() => onSelectedItem(key)}
                                title={filename}
                                description={mome}
                                left={props => <List.Icon {...props} icon={mimeToIconName(mome)} />}
                                right={props =>
                                    selectedItems[key] ?
                                        uploadingItems[key] == "upload" ? <ActivityIndicator size="small" animating={true} color="green" style={{ paddingEnd: 5 }} />
                                            : <List.Icon {...props} icon={uploadingItems[key] === "done" ? "cloud-check" : "check"} color="green" />
                                        : null}
                            />)
                    })
                }

            </ScrollView>
            {Object.keys(selectedItems).length > 0 && <FAB
                style={styles.fab}
                small={false}
                icon="upload"
                loading={uploading}
                onPress={() => {
                    setTimeout(() => {
                        setUploading(s=>{
                            if(!s)
                                uploadFiles();
                            return true;
                        });
                    }, 0);
                }}
            />}
        </View >
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    menuItem: {
        flexDirection: 'row',
        height: 60,
        padding: 5,
        margin: 5,
        borderWidth: 1,
        borderColor: "gray"
    },
    text: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        textAlignVertical: 'center'
    }
});

export default ZipFileExplorer;