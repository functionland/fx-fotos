import React, { memo, useState } from 'react';
import { Text } from 'react-native'
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

    return isEmpty ? (
        <Text>Looding</Text>
    ) : (
        <RecyclerAssetList
            refreshData={refreshData}
            numCols={3}
            sections={sections}
        />
    );
};

export default AssetList;
