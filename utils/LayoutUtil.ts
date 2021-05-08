import { LayoutProvider } from 'recyclerlistview';
import { Dimensions } from 'react-native';

const headerHeight:number = 20;
export class LayoutUtil {
  static getWindowWidth() {
    // To deal with precision issues on android
    return Math.round(Dimensions.get('window').width * 1000) / 1000; //Adjustment for margin given to RLV;
  }
  static getLayoutProvider(colNum:number, groupBy:string, headerIndexes:Array<{header:string;index:number}>) {
    switch (groupBy) {
      case 'day':
        return new LayoutProvider(
          () => {
            return colNum; //Since we have just one view type
          },
          (type, dim, index) => {
            let isHeader = headerIndexes.findIndex(x=>x.index===index);
            const windowWidth = LayoutUtil.getWindowWidth();
            if(isHeader > -1){
              dim.width = windowWidth;
              dim.height = headerHeight;
            }else{
              dim.width = windowWidth / colNum;
              dim.height = windowWidth / colNum;
            }
          }
        );
      case 'month':
        return new LayoutProvider(
          () => {
            return colNum;
          },
          (type, dim, index) => {
            let isHeader = headerIndexes.findIndex(x=>x.index===index);
            const windowWidth = LayoutUtil.getWindowWidth();
            if(isHeader > -1){
              dim.width = windowWidth;
              dim.height = headerHeight;
            }else{
              dim.width = windowWidth / colNum;
              dim.height = windowWidth / colNum;
            }
          }
        );
      default:
        return new LayoutProvider(
          () => {
            return 2;
          },
          (type, dim, index) => {
            let isHeader = headerIndexes.findIndex(x=>x.index===index);
            const windowWidth = LayoutUtil.getWindowWidth();
            if(isHeader > -1){
              dim.width = windowWidth;
              dim.height = headerHeight;
            }else{
              dim.width = windowWidth / colNum;
              dim.height = windowWidth / colNum;
            }
          }
        );
    }
  }
}
