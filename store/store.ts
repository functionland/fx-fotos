import {applyMiddleware, createStore} from 'redux';
import {reducer} from './reducer';
import thunk from "redux-thunk"

const initialStore = {
  user: {
    name: 'Ali Balouchi',
    email: 'alibalouchi.74@gmail.com',
    token: '',
  },
  photos: [],
  Box: [
    {
      node: {
        group_name: '',
        image: [
          {
            fileSize: null,
            filename: null,
            height: null,
            playableDuration: null,
            uri: '',
            width: null,
          },
        ],
        location: null,
        timestamp: 0,
        type: '',
      },
    },
  ],
  error: [],
  sortCondition: 'day',
  numColumns: 2,
  loading: false,
  numberOfPhotos: 20
};

let store = createStore(reducer as any, initialStore, applyMiddleware(thunk));

export default store;
