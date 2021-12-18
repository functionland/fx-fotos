import React, { memo, useState } from 'react';
import { Text, View, TouchableHighlight, StyleSheet } from 'react-native'
import RecyclerAssetList from './recycler-asset-list';

import { RecyclerAssetListSection } from "../../types"
interface Props {
    refreshData: () => Promise<void>;
    sections: RecyclerAssetListSection[];
}

const AssetList = ({
    refreshData,
    sections
}: Props): JSX.Element => {
    const [numCols, setColNums] = useState(4);
    return (<View style={styles.container}>
        <TouchableHighlight style={{ width: "100%", height: 50, justifyContent: "center", alignItems: "center", backgroundColor: "grey" }} onPress={() => {
            if (numCols < 5)
                setColNums(numCols + 1)
            else
                setColNums(1)

        }}>
            <Text style={{ fontSize: 20 }} >Change the view: {numCols}</Text>
        </TouchableHighlight>

        <RecyclerAssetList
            refreshData={refreshData}
            numCols={numCols}
            sections={sections}
        />
    </View>);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
export default AssetList;
