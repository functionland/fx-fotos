import Cameraroll from '@react-native-community/cameraroll';

export const getUserInfo = (username: string, password: string) => {
  console.log(username, password);
  let user = {
    name: 'Ali Balouchi',
    email: 'alibalouchi.74@gmail.com',
    token: '',
  };
  return user;
};

export const getUserBoxMedia = (userToken: string) => {
  console.log('Box Media Fetched');
  let boxMedia = [];
  return boxMedia;
};

export const getStorageMedia = () => {
  let photos;

  Cameraroll.getPhotos({
    first: 50,
    assetType: 'All',
  })
    .then((res) => {
      photos = res.edges;
      return photos;
    })
    .catch((error) => {
      console.log(error);
      return 'error';
    });
  console.log('camera');
  return 'error';
};
