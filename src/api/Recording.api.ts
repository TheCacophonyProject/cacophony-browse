import CacophonyApi from "./CacophonyApi";
import * as querystring from "querystring";

export default {
  query,
  id,
  comment,
  del,
  tracks,
  addTrackTag,
  deleteTrackTag,
  replaceTrackTag
};

export type DeviceId = number;
export type RecordingId = number;
export type TrackId = number;
export type TagId = number;
export type UserId = number;
export type TrackTagId = number;
export type GroupId = number;
type JwtToken<T> = string;
type UtcTimestamp = string;

interface FetchResult<T> {
  result: T;
  success: boolean;
  status: number;
}

interface Device {
  id: DeviceId;
  devicename: string;
}

interface Location {
  type: "Point" | string;
  coordinates: [number, number];
}

export type RecordingType = "thermalRaw" | "audio";

export interface RecordingInfo {
  id: RecordingId;
  type: RecordingType;
  recordingDateTime: UtcTimestamp;
  rawMimeType: string;
  fileMimeType: string;
  processingState: "FINISHED"; // Or?
  duration: number; //seconds
  location: Location;
  batteryLevel: null;
  DeviceId: DeviceId;
  GroupId: GroupId;
  Group: {
    groupname: string;
  };
  Tags: Tag[];
  Tracks: Track[];
  Device: Device;

  fileKey?: string;
  comment?: string | null;
  rawFileKey?: string;
  relativeToDawn?: null;
  relativeToDusk?: null;
  version?: null;
  batteryCharging?: null;
  airplaneModeOn?: null;
  additionalMetadata?: {
    algorithm: number;
    previewSecs: number;
  };
}
type Mp4File = "string";
type CptvFile = "string";
export interface Recording {
  messages: [];
  recording: RecordingInfo;
  rawSize: number; // CPTV size
  fileSize: number; // MP4 size
  downloadFileJWT: JwtToken<Mp4File>;
  downloadRawJWT: JwtToken<CptvFile>;
  success: boolean;
}

type Seconds = number;
type Rectangle = [number, number, number, number];

export interface Track {
  id: TrackId;
  data: {
    positions: [Seconds, Rectangle][];
    start_s: Seconds;
    end_s: Seconds;
    tag: string;
    label: string;
    clarity: number;
    confidence: number;
    num_frames: number;
    max_novelty: number;
    average_novelty: number;
    all_class_confidences: Record<string, number>;
  };
  createdAt: UtcTimestamp;
  updatedAt: UtcTimestamp;
  archivedAt: UtcTimestamp | null;
  AlgorithmId: number;
  TrackTags: TrackTag[];
}

export interface User {
  username: string;
  id?: number;
  email: string;
  globalPermission: "read" | "write" | "off";
}

export interface TrackTag {
  id: TrackTagId;
  TrackId: TrackId;
  UserId?: UserId;
  what: string;
  confidence?: number;
  automatic?: boolean;
  data?: "";
  createdAt: UtcTimestamp;
  updatedAt?: UtcTimestamp;
  User?: User;
}

export interface Tag {
  what: string;
  confidence: number;
}

export interface QueryResult<T> {
  count: number;
  limit: string; // NOTE(jon): Actually, a number, but comes back as a string...
  messages: string[];
  offset: string; // NOTE(jon): Actually, a number, but comes back as a string...
  rows: T[];
  success: boolean;
}

export type TagMode =
  | "any"
  | "no-human"
  | "tagged"
  | "human-tagged"
  | "automatic-tagged"
  | "both-tagged"
  | "untagged";

export interface Query {
  where: {
    duration: { $gte: number };
    type: RecordingType;
  };
  limit: number;
  offset: number;
  tagMode: TagMode;
}

const apiPath = "/api/v1/recordings";

function query(params: any): Promise<FetchResult<QueryResult<RecordingInfo>>> {
  // Params must include where (stringified JSON), limit, offset
  // Params can also include tagMode, tags, order
  return CacophonyApi.get(`${apiPath}?${querystring.stringify(params)}`);
}

function id(id: RecordingId): Promise<FetchResult<Recording>> {
  return CacophonyApi.get(`${apiPath}/${id}`);
}

function comment(comment: string, id: RecordingId): Promise<FetchResult<any>> {
  return CacophonyApi.patch(`${apiPath}/${id}`, {
    updates: {
      comment: comment
    }
  });
}

function del(id: RecordingId): Promise<FetchResult<any>> {
  return CacophonyApi.delete(`${apiPath}/${id}`);
}

function tracks(
  recordingId: RecordingId
): Promise<FetchResult<{ tracks: Track[] }>> {
  return CacophonyApi.get(`${apiPath}/${recordingId}/tracks`);
}

function replaceTrackTag(
  tag: TrackTag,
  recordingId: RecordingId,
  trackId: TrackId
) {
  const body = {
    what: tag.what,
    confidence: tag.confidence,
    automatic: "false"
  };
  return CacophonyApi.post(
    `${apiPath}/${recordingId}/tracks/${trackId}/replaceTag`,
    body
  );
}

function addTrackTag(
  tag: Tag,
  recordingId: RecordingId,
  trackId: TrackId
): Promise<FetchResult<{ trackTagId: number; success: boolean }>> {
  const body = {
    what: tag.what,
    confidence: tag.confidence,
    automatic: false
  };
  return CacophonyApi.post(
    `${apiPath}/${recordingId}/tracks/${trackId}/tags`,
    body
  );
}

function deleteTrackTag(
  tag: TrackTag,
  recordingId: RecordingId
): Promise<FetchResult<any>> {
  return CacophonyApi.delete(
    `${apiPath}/${recordingId}/tracks/${tag.TrackId}/tags/${tag.id}`
  );
}
