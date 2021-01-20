import {Reducer} from 'react';
import {reduxAction, reduxState} from '../types/interfaces';
import {getUserInfo, getUserBoxMedia} from '../utils/APICAlls';
import {Constant} from '../utils/constants';
import store from './store';

export const reducer: Reducer<reduxState, reduxAction> = (
  state: reduxState,
  action: reduxAction,
) => {
  switch (action.type) {
    case Constant.actionTypes.box.setBoxMedia:
      let boxMedia = getUserBoxMedia(state.user.token);
      console.log('box', boxMedia);
      return {...state, box: boxMedia};

    case Constant.actionTypes.user.setUser:
      let userInfo = getUserInfo(
        action.payload.username,
        action.payload.password,
      );

      return {...state, user: userInfo};

    default:
      return {...state};
  }
};
