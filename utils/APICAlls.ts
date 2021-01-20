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
  let boxMedia = [
    {
      node: {
        group_name: 'WhatsApp Images',
        image: {
          fileSize: 0,
          filename: '',
          height: 0,
          playableDuration: 0,
          uri: 'file:///storage/emulated/0/DCIM/Camera/IMG_20210113_165037.jpg',
          width: 0,
        },
        location: {
          latitude: undefined,
          longitude: undefined,
          altitude: undefined,
          heading: undefined,
          speed: undefined,
        },
        timestamp: 1610774529,
        type: 'image/jpeg',
      },
    },
    {
      node: {
        group_name: 'WhatsApp Images',
        image: {
          fileSize: 0,
          filename: '',
          height: 0,
          playableDuration: 0,
          uri: 'file:///storage/emulated/0/DCIM/Camera/VID_20210113_181743.mp4',
          width: 0,
        },
        location: {
          latitude: undefined,
          longitude: undefined,
          altitude: undefined,
          heading: undefined,
          speed: undefined,
        },
        timestamp: 1610774529,
        type: 'image/jpeg',
      },
    },
    {
      node: {
        group_name: 'WhatsApp Images',
        image: {
          fileSize: 0,
          filename: '',
          height: 0,
          playableDuration: 0,
          uri:
            'file:///storage/emulated/0/DCIM/Screenshots/Screenshot_2021-01-13-20-31-37-926_lockscreen.jpg',
          width: 0,
        },
        location: {
          latitude: undefined,
          longitude: undefined,
          altitude: undefined,
          heading: undefined,
          speed: undefined,
        },
        timestamp: 1610774529,
        type: 'image/jpeg',
      },
    },
    {
      node: {
        group_name: 'WhatsApp Images',
        image: {
          fileSize: 0,
          filename: '',
          height: 0,
          playableDuration: 0,
          uri:
            'file:///storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG-20210113-WA0045.jpg',
          width: 0,
        },
        location: {
          latitude: undefined,
          longitude: undefined,
          altitude: undefined,
          heading: undefined,
          speed: undefined,
        },
        timestamp: 1610774529,
        type: 'image/jpeg',
      },
    },
    {
      node: {
        group_name: 'WhatsApp Images',
        image: {
          fileSize: 0,
          filename: '',
          height: 0,
          playableDuration: 0,
          uri:
            'file:///storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG-20210116-WA0004.jpg',
          width: 0,
        },
        location: {
          latitude: undefined,
          longitude: undefined,
          altitude: undefined,
          heading: undefined,
          speed: undefined,
        },
        timestamp: 1610774529,
        type: 'image/jpeg',
      },
    },
  ];
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
