export interface Quality2 {
  id: number;
  name: string;
  source: string;
  resolution: number;
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

export interface Language {
  id: number;
  name: string;
}

export interface MediaInfo {
  audioChannels: number;
  audioCodec: string;
  videoCodec: string;
}

export interface EpisodeFile {
  seriesId: number;
  seasonNumber: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: Date;
  sceneName: string;
  quality: Quality;
  language: Language;
  mediaInfo: MediaInfo;
  originalFilePath: string;
  qualityCutoffNotMet: boolean;
  id: number;
}

export interface Image {
  coverType: string;
  url: string;
}

export interface Season {
  seasonNumber: number;
  monitored: boolean;
}

export interface Ratings {
  votes: number;
  value: number;
}

export interface Series {
  title: string;
  sortTitle: string;
  seasonCount: number;
  status: string;
  overview: string;
  network: string;
  airTime: string;
  images: Image[];
  seasons: Season[];
  year: number;
  path: string;
  profileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: Date;
  lastInfoSync: Date;
  seriesType: string;
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  genres: string[];
  tags: any[];
  added: Date;
  ratings: Ratings;
  qualityProfileId: number;
  id: number;
}

export interface CalendarEntry {
  seriesId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string;
  airDateUtc: Date;
  overview: string;
  episodeFile: EpisodeFile;
  hasFile: boolean;
  monitored: boolean;
  unverifiedSceneNumbering: boolean;
  series: Series;
  id: number;
}

export interface TelegramCalendarResponseLine {
  seriesName: string;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string;
  overview: string;
  hasFile: boolean;
  seriesType: string;
}