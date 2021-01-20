import {PhotoIdentifier} from '@react-native-community/cameraroll';

export interface reduxState {
  user: {
    name: string;
    email: string;
    token: string;
  };
  box: Array<PhotoIdentifier>;
}

export interface reduxAction {
  type: string;
  payload: any;
}
