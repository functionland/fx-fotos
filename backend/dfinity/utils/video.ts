import { useEffect, useState } from "react";
import {
  createVideo,
  getVideoInfo,
  putVideoChunk,
  putVideoPic,
} from "./canister";
import { VideoInfo, VideoInit } from "./canister/typings";
import { MAX_CHUNK_SIZE, encodeArrayBuffer, hashtagRegExp } from "./index";

// Determines number of chunks and creates the VideoInfo
export function getVideoInit(
  userId: string,
  file: File,
  caption: string
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
  };
}

export interface UploadVideoInit {
  name: string;
  caption: string;
  chunkCount: number;
  userId: string;
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
	console.log(sliceToNat.length);
  return putVideoChunk(videoId, chunk, sliceToNat);
}

// Wraps up the previous functions into one step for the UI to trigger
async function uploadVideo(userId: string, file: File, caption: string) {
	console.log('uploadVideo started');
  const videoBuffer = (await file?.arrayBuffer()) || new ArrayBuffer(0);
	console.log('videoBuffer fetched');
  const videoInit = getVideoInit(userId, file, caption);
	console.log('videoInit done for userId '+userId);
	console.log(videoInit);
  const videoId = await createVideo(videoInit);
	console.log('video created='+videoId)
  let chunk = 1;
  const thumb = await generateThumbnail(file);
  await uploadVideoPic(videoId, thumb);
	console.log('uploadVideoPic done');
  const putChunkPromises: Promise<[] | [null]>[] = [];
	console.log(videoBuffer.byteLength);
	console.log(file.size);
	console.log(chunk);
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

// This hook exposes functions to set video data, trigger the upload, and return
// with "success" to toggle loading states.
export function useUploadVideo({ userId }: { userId: string }) {
  const [completedVideo, setCompletedVideo] = useState<VideoInfo>();
  const [file, setFile] = useState<File>();
  const [caption, setCaption] = useState("");
  const [ready, setReady] = useState(false);

  async function handleUpload(fileToUpload: File) {
    console.info("Storing video...");
    try {
      const video = await uploadVideo(userId, fileToUpload, caption);
			console.log('uploadVideo completed');
      setCompletedVideo(video);
      setReady(false);
      setFile(undefined);
    } catch (error) {
      console.log("Failed to store video.", error);
    }
  }

  useEffect(() => {
    if (ready && file !== undefined) {
      handleUpload(file);
    }
  }, [ready]);

  return {
    completedVideo,
    setCaption,
    setFile,
    setReady,
  };
}
