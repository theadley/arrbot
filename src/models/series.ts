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
  coverType: string
  remoteUrl: string
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
  title: string
  sortTitle: string
  status: string
  ended: boolean
  overview: string
  network: string
  airTime: string
  images: Image[]
  originalLanguage: Language
  seasons: Season[]
  year: number
  path: string
  qualityProfileId: number
  seasonFolder: boolean
  monitored: boolean
  monitorNewItems: string
  useSceneNumbering: boolean
  runtime: number
  tvdbId: number
  tvRageId: number
  tvMazeId: number
  firstAired: string
  lastAired: string
  seriesType: string
  cleanTitle: string
  imdbId: string
  titleSlug: string
  certification: string
  genres: string[]
  tags: any[]
  added: string
  ratings: Ratings
  languageProfileId: number
  id: number
}

export interface CalendarEntry {
  seriesId: number;
  tvdbId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string;
  airDateUtc: Date;
  runtime: number;
  overview: string;
  episodeFile: EpisodeFile;
  hasFile: boolean;
  monitored: boolean;
  absoluteEpisodeNumber: number;
  sceneAbsoluteEpisodeNumber: number
  sceneEpisodeNumber: number
  sceneSeasonNumber: number
  unverifiedSceneNumbering: boolean
  series: Series
  images: Image[]
  id: number
}


export interface TelegramCalendarResponseLine {
  seriesName: string;
  seasonNumber: number;
  episodeNumber: number;
  airDate: string;
  overview: string;
  hasFile: boolean;
  seriesType: string;
  quality: string;
  genres: string[];
  image: string;
}
