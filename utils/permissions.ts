import * as MediaLibrary from 'expo-media-library';

export async function storagePermission() {
  let {granted} = await MediaLibrary.getPermissionsAsync();
  if (!granted) {
    let {granted: g} = await MediaLibrary.requestPermissionsAsync();
    return g;
  }
  return granted;
}
