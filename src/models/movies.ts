export interface OriginalLanguage {
  id: number;
  name: string;
}

export interface Language {
  id: number;
  name: string;
}

export interface AlternateTitle {
  sourceType: string;
  movieId: number;
  title: string;
  sourceId: number;
  votes: number;
  voteCount: number;
  language: Language;
  id: number;
}

export interface Image {
  coverType: string;
  url: string;
}

export interface Imdb {
  votes: number;
  value: number;
  type: string;
}

export interface Tmdb {
  votes: number;
  value: number;
  type: string;
}

export interface Metacritic {
  votes: number;
  value: number;
  type: string;
}

export interface RottenTomatoes {
  votes: number;
  value: number;
  type: string;
}

export interface Ratings {
  imdb: Imdb;
  tmdb: Tmdb;
  metacritic: Metacritic;
  rottenTomatoes: RottenTomatoes;
}

export interface Quality2 {
  id: number;
  name: string;
  source: string;
  resolution: number;
  modifier: string;
}

export interface Revision {
  version: number;
  real: number;
  isRepack: boolean;
}

export interface Quality {
  quality: Quality2;
  revision: Revision;
}

export interface MediaInfo {
  audioBitrate: number;
  audioChannels: number;
  audioCodec: string;
  audioLanguages: string;
  audioStreamCount: number;
  videoBitDepth: number;
  videoBitrate: number;
  videoCodec: string;
  videoDynamicRangeType: string;
  videoFps: number;
  resolution: string;
  runTime: string;
  scanType: string;
  subtitles: string;
}

export interface Language2 {
  id: number;
  name: string;
}

export interface MovieFile {
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: Date;
  sceneName: string;
  indexerFlags: number;
  quality: Quality;
  mediaInfo: MediaInfo;
  originalFilePath: string;
  qualityCutoffNotMet: boolean;
  languages: Language2[];
  releaseGroup: string;
  edition: string;
  id: number;
}

export interface Collection {
  name: string;
  tmdbId: number;
  images: any[];
}

export interface RootObject {
  title: string;
  originalTitle: string;
  originalLanguage: OriginalLanguage;
  alternateTitles: AlternateTitle[];
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: Date;
  physicalRelease: Date;
  digitalRelease: Date;
  images: Image[];
  website: string;
  year: number;
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  certification: string;
  genres: string[];
  tags: any[];
  added: Date;
  ratings: Ratings;
  movieFile: MovieFile;
  collection: Collection;
  id: number;
}