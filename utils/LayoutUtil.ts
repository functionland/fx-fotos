import { LayoutProvider } from 'recyclerlistview';
import { Dimensions } from 'react-native';
import {layout, headerIndex} from '../types/interfaces';

export class LayoutUtil {
  static getWindowWidth() {
    // To deal with precision issues on android
    return Math.round(Dimensions.get('window').width * 1000) / 1000; //Adjustment for margin given to RLV;
  }
  static getWindowHeight() {
    // To deal with precision issues on android
    return Math.round(Dimensions.get('window').height * 1000) / 1000; //Adjustment for margin given to RLV;
  }
  static getSingleImageLayoutProvider() {
    return new LayoutProvider(
      () => {
        return 2; //Since we have just one view type
      },
      (type, dim, index) => {
        const windowWidth = LayoutUtil.getWindowWidth();
        const windowHeight = LayoutUtil.getWindowHeight();
        dim.width = windowWidth;
        dim.height = windowHeight;
      }
    );
  }
  static getLayoutProvider(colNum:number, groupBy:string, headerIndexes:headerIndex[], headerHeight:number=20, data:layout[], storiesHeight:number) {
        return new LayoutProvider(
          (index) => {
            return index===0?'story':'image'; //Since we have just one view type
          },
          (type, dim, index) => {
            const windowWidth = LayoutUtil.getWindowWidth();
            if(type==='story'){
              dim.width = windowWidth;
              dim.height = storiesHeight+25;
            }else{
              if(data[index].sortCondition===groupBy || data[index].sortCondition===""){
                let isHeader = headerIndexes.findIndex(x=>x.index===index && x.sortCondition===groupBy);
                if(isHeader > -1){
                  dim.width = windowWidth;
                  dim.height = headerHeight;
                }else{
                  dim.width = windowWidth / colNum;
                  dim.height = windowWidth / colNum;
                }
              }else{
                dim.width = 0;
                dim.height = 0;
              }
            }
          }
        );
  }
}
