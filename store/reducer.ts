import {Reducer} from 'react';
import {Animated, Easing} from 'react-native';
import {reduxAction, reduxState} from '../types/interfaces';
import {getUserInfo, getUserBoxMedia} from '../utils/APICAlls';
import {Constant} from '../utils/constants';

export const reducer: Reducer<reduxState, reduxAction> = (
  state: reduxState,
  action: reduxAction,
) => {
  // switch (action.type) {
  //   case Constant.actionTypes.box.setBoxMedia:
  //     let boxMedia = getUserBoxMedia(state.user.token);
  //     console.log('box', boxMedia);
  //     return {...state, box: boxMedia};

  //   case Constant.actionTypes.user.setUser:
  //     let userInfo = getUserInfo(
  //       action.payload.username,
  //       action.payload.password,
  //     );

  //     return {...state, user: userInfo};

  //   case Constant.actionTypes.sortConditionChange:
  //     return {...state, sortCondition: action.payload};

  //   case Constant.actionTypes.numColumnsChange:
  //     return {...state, numColumns: action.payload};
  //   default:
  //     return {...state};
  // }
  switch (action.type) {
    case Constant.actionTypes.photos.getPhotosRequest:
      return {
        ...state,
        loading: true,
        error: [],
      };
    case Constant.actionTypes.photos.getPhotosSuccess:
      return {
        ...state,
        loading: false,
        error: [],
        photos: action.payload,
        numberOfPhotos: state.numberOfPhotos + 20
      };
    case Constant.actionTypes.photos.getPhotosFailure:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return {...state};
  }
};
