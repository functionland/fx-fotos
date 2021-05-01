import * as MediaLibrary from "expo-media-library";

export async function storagePermission() {
  let { granted } = await MediaLibrary.getPermissionsAsync();
  if(!granted){
    let { granted } = await MediaLibrary.requestPermissionsAsync();
    return granted;
  }
  return granted;
}
