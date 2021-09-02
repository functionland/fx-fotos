import { useEffect, useState } from "react";
import {
  createVideo,
  getVideoInfo,
  putVideoChunk,
  putVideoPic,
	getProfileVideos,
	shareVideo,
	getProfileAlbums,
	addVideo2Album,
} from "./canister";
import { VideoInfo, VideoInit } from "../dfx/CanCand";
import { MAX_CHUNK_SIZE, encodeArrayBuffer, hashtagRegExp } from "./index";

// Determines number of chunks and creates the VideoInfo
export function getVideoInit(
  userId: string,
  file: File,
  caption: string,
	id: string,
): VideoInit {
  const chunkCount = Number(Math.ceil(file.size / MAX_CHUNK_SIZE));
  return {
    caption,
    // @ts-ignore
    chunkCount,
    // @ts-ignore
    createdAt: Number(Date.now() * 1000), // motoko is using nanoseconds
    name: file.name.replace(/\.mp4/, ""),
    tags: caption.match(hashtagRegExp) || [],
    userId,
		externalId: id,
		lastModifiedAt: [],
		geoData: [],
		geoDataExif: [],
		people: [],
		uploadedFrom: [],
		album: [],
  };
}

export interface UploadVideoInit {
  name: string;
  caption: string;
  chunkCount: number;
  userId: string;
	externalId: string;
}

// Divides the file into chunks and uploads them to the canister in sequence
async function processAndUploadChunk(
  videoBuffer: ArrayBuffer,
  byteStart: number,
  videoSize: number,
  videoId: string,
  chunk: number
) {
	console.log('processAndUploadChunk started for chunk '+chunk);
  const videoSlice = videoBuffer.slice(
    byteStart,
    Math.min(videoSize, byteStart + MAX_CHUNK_SIZE)
  );
	console.log('videoSlice finished');
  const sliceToNat = encodeArrayBuffer(videoSlice);
	console.log('sliceToNat finished');
  return putVideoChunk(videoId, chunk, sliceToNat);
}

// Wraps up the previous functions into one step for the UI to trigger
async function uploadVideo(userId: string, file: File, caption: string, id: string) {
	console.log('uploadVideo started');
  const videoBuffer = (await file?.arrayBuffer()) || new ArrayBuffer(0);
	console.log('videoBuffer fetched');
  const videoInit = getVideoInit(userId, file, caption, id);
	console.log('videoInit done for userId '+userId);
  const videoId = await createVideo(videoInit);
	console.log('video created='+videoId)
  let chunk = 1;
  const thumb = await generateThumbnail(file);
  await uploadVideoPic(videoId, thumb);
	console.log('uploadVideoPic done');
  const putChunkPromises: Promise<[] | [null]>[] = [];
	console.log('putChunkPromises done');
  for (
    let byteStart = 0;
    byteStart < file.size;
    byteStart += MAX_CHUNK_SIZE, chunk++
  ) {
    putChunkPromises.push(
      processAndUploadChunk(videoBuffer, byteStart, file.size, videoId, chunk)
    );
  }

  await Promise.all(putChunkPromises);
	console.log('video upload finished');
  return await checkVidFromIC(videoId, userId);
}

// This isn't Internet Computer specific, just a helper to generate an image
// from a video file
export function generateThumbnail(videoFile: File) {

  return new Promise<number[]>((resolve, reject) => {
    resolve([...new Uint8Array(0)]);
  });
}

// Stores the videoPic on the canister
async function uploadVideoPic(videoId: string, file: number[]) {
  console.log("Storing video thumbnail...");
  try {
    await putVideoPic(videoId, file);
    console.log(`Video thumbnail stored for ${videoId}`);
  } catch (error) {
    console.error("Unable to store video thumbnail:", error);
  }
}

// Gets videoInfo from the IC after we've uploaded
async function checkVidFromIC(videoId: string, userId: string) {
  console.log("Checking canister for uploaded video...");
  const resultFromCanCan = await getVideoInfo(userId, videoId);
  if (resultFromCanCan === null) {
    throw Error("Invalid video received from CanCan Canister");
  }
  console.log("Upload verified.");
  return resultFromCanCan;
}

export async function getUserVideos(userId: string) {
	console.log("Getting user videos...");
	const resultFromCanCan = await getProfileVideos(userId);
  console.log("User videos fetched");
  return resultFromCanCan;
}

export async function getUserAlbums(userId: string) {
	console.log("Getting user albums...");
	const resultFromCanCan = await getProfileAlbums(userId);
  console.log("User albums fetched");
	console.log(resultFromCanCan);
  return resultFromCanCan;
}

export async function addVideoToAlbum(album: string, videoId: string, userId: string) {
  console.log("Adding video to Album...");
  try {
    return await addVideo2Album(album, videoId, userId);
    console.log(`Added video to album for ${videoId}`);
  } catch (error) {
    console.error("Unable to add video to album:", error);
  }
}

export async function shareMedia(videoId:string, targetUserId: string) {
	console.log("Sharing user video...");
	const resultFromCanCan = await shareVideo(videoId, targetUserId);
  console.log("User video shared");
	console.log(resultFromCanCan);
  return resultFromCanCan;
}

// This hook exposes functions to set video data, trigger the upload, and return
// with "success" to toggle loading states.
export function useUploadVideo({ userId }: { userId: string }) {
  const [completedVideo, setCompletedVideo] = useState<VideoInfo>();
  const [file, setFile] = useState<File>();
  const [caption, setCaption] = useState("");
	const [id, setId] = useState("");
  const [ready, setReady] = useState(false);

  async function handleUpload(fileToUpload: File, id: string) {
    console.info("Storing video...");
    try {
      const video = await uploadVideo(userId, fileToUpload, caption, id);
			console.log('uploadVideo completed');
      setCompletedVideo(video);
      setReady(false);
      setFile(undefined);
			setId("");
    } catch (error) {
      console.log("Failed to store video.", error);
    }
  }

  useEffect(() => {
    if (ready && file !== undefined) {
      handleUpload(file, id);
    }
  }, [ready]);

  return {
    completedVideo,
    setCaption,
    setFile,
		setId,
    setReady,
  };
}
