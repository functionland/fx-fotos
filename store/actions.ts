import {Constant} from '../utils/constants';
import {getStoragePhotos} from '../utils/functions';
import {storagePermission} from '../utils/permissions';

export const getPhotos = () => {
  return async (dispatch: any, getState: any) => {
    let permission = false;
    const state = getState()
    const numberOfPhotos = state.numberOfPhotos

    dispatch({type: Constant.actionTypes.photos.getPhotosRequest});

    await storagePermission()
      .then(() => (permission = true))
      .catch((err) =>
        dispatch({
          type: Constant.actionTypes.photos.getPhotosFailure,
          payload: err,
        }),
      );

    try {
      const response = await getStoragePhotos(permission,  numberOfPhotos + 20);
      dispatch({
        type: Constant.actionTypes.photos.getPhotosSuccess,
        payload: response?.edges,
      });
    } catch {
      dispatch({
        type: Constant.actionTypes.photos.getPhotosFailure,
        payload: 'The getting photos request failed',
      });
    }
  };
};
