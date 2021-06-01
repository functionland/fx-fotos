# BOX Photos development guide

## Project Description
BOX Photos is a react-native(expo)+typescript application to replace Google Photos/Apple Photos, and give freedom in hosting your photos on any platform, either centralized servers like Amazon or Microsoft, or decentralized solutions like "BOX". It is optimized for decentralized IPFS platforms like "BOX". Your can easily use it with a "BOX" to host your files and photos with the same experience you had using Google Photos, however, with full privacy.

## demo
Checkout demo video at: https://youtu.be/wDxaC1HF5PQ

## table of content

- [Clone the project](#clone-the-project)
- [Install requirements](#install-requirements)
- [Packages](#packages)
- [Pages structure](#pages-structure)
- [Components structure](#components-structure)
- [Components descripction](#components-descripction)

## Clone the project

You can clone the project by running the command below to your terminal:

for https cloning:
```bash
git clone https://github.com/functionland/photos.git
```

for ssh cloning:
```bash
git clone git@github.com:functionland/photos.git
```
[project github link](https://github.com/woforo/TheBox)

## Install requirements

you can install the requirements with command:
```bash
expo install
```
or
```bash
npm install
```

## Packages

- We used **expo Media Libary** for getting the data from user's phone.
- We used a modified version of **expo-video-player** to play videos. It is available in our repo.
- We used a modified version of **react-native-stories-view** for the story style view on top of gallery, which is available in our repo.
- We used **RecycerListView** from FlipKart, as the scrollView for the photos.

## Pages structure

For now we have two pages in the app:
- The HomePage that is the main page for showing the media files.
- The PermissionError page that is the page we show when there is permission error from user's phone.
- We are working on creating the "Library" and "Search" pages.

## Components structure

```├── app.json
├── App.tsx
├── babel.config.js
├── components
│   ├── AllPhotos.tsx
│   ├── FloatingFilters.tsx
│   ├── Header.tsx
│   ├── Highlights.tsx
│   ├── Media.tsx
│   ├── PhotosChunk.tsx
│   ├── PhotosContainer.tsx
│   ├── PinchZoom.tsx
│   ├── RenderPhotos.tsx
│   ├── SingleMedia.tsx
│   ├── StoryHolder.tsx
│   └── ThumbScroll.tsx
├── index.js

├── metro.config.js
├── navigation
│   └── AppNavigation.tsx
├── package.json
├── package-lock.json
├── pages
│   ├── HomePage.tsx
│   └── PermissionError.tsx
├── store
│   ├── actions.ts
│   ├── reducer.ts
│   └── store.ts
├── __tests__
│   └── App-test.tsx
├── tsconfig.json
├── types
│   └── interfaces.ts
└── utils
    ├── APICalls.ts
    ├── constants.ts
    ├── functions.ts
    ├── LayoutUtil.ts
    └── permissions.ts

```

## Components descripction

The components are as follows:
### PhotosContainer
**Purpose:** this component is responsible for getting the photos and videos from storage and feed the AllPhotos component with storage photos.
- this component include the PinchZoom component and AllPhotos component
### PinchZoom
**Purpose:** This component is responsible for all the animations for switching between different column modes, and actions we want to do when animations done.
- This component is wraped around the AllPhotos component.
- The component uses GestureHandlers to respond to pinch and pan gestures

### AllPhotos
**Purpose:** This component is wraped the three RenderPhotos components and is responsible for lazy load the photos and feed the render photos with proper data.
-  The three different kind of RenderPhotos is the month view with 4 columns of photos, the day view with 3 columns of photos and the day view with 2 columns of photos.

### RenderPhotos
**Purpose:** This component includes with the number of PhotosChunk components and one FlatList that wraped all the PhotosChunk components that we want to show the user. It is responsible to show the Photos(main) page of hte application.
- This component also renders date headers.
- It uses RecylerListView to show the scrollable grid of photos

### PhotosChunk:
**Purpose:** This component is responsible to show each block/Thumbnails in the gallery.

### FloatingFilters:
**Purpose:** This component is responsible to show and position the "year" titles when fingers are placed on thumb scroll.

### Header:
**Purpose:** This component is responsible to show the top header of the application. It is used in the top Navigationbar.

### Highlights:
**Purpose:** This component is responsible to show the story thumbnails and text on top of Photos page.

### Media:
**Purpose:** This component is responsible to display photo or video when opened in full page. It is the component used in SingleMedia.

### SingleMedia:
**Purpose:** This component is responsible to show modal with the content when imae or video is opened in full page. It uses Media to show the photo or video.

### StoryHolder:
**Purpose:** This component is responsible to show each story/highlight in full screen when thumbnail is clicked on.

### ThumbScroll:
**Purpose:** This component is responsible to show the thumb scroll icon in the right of screen when scrolling.

## Components diagram

```mermaid
graph LR
App <-- AppNavigation <-- PermissionError
AppNavigation <-- Header
AppNavigation <-- HomePage <-- PhotosContainer <-- AllPhotos <-- RenderPhotos
PhotosContainer <-- PinchZoom
AllPhotos <-- StoryHolder <-- StoryContainer <-- (Story Component)
AllPhotos <-- SingleMedia <-- Media
RenderPhotos <-- PhotosChunk
RenderPhotos <-- ThumbScroll
RenderPhotos <-- Highlights
RenderPhotos <-- FloatingFilters
```
