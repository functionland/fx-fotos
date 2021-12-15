import React, { memo, useState } from 'react';
import { Text, View,TouchableHighlight } from 'react-native'
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
    const [numCols,setColNums]=useState(4);
    return !sections?.length ? (
        <Text>Looding</Text>
    ) : (<View style={{flex:1}}>
        <TouchableHighlight style={{width:"100%",height:50,justifyContent:"center",alignItems:"center",backgroundColor:"grey"}} onPress={()=>{
            if(numCols<5)
                setColNums(numCols+1)
            else
                setColNums(1)
                
        }}>
            <Text style={{fontSize:20}} >Change the view: {numCols}</Text>
        </TouchableHighlight>

        <RecyclerAssetList
            refreshData={refreshData}
            numCols={numCols}
            sections={sections}
            //renderAheadOffset={500}
        />
    </View>
    );
};

export default AssetList;
