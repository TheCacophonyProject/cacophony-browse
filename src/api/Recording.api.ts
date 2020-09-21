import CacophonyApi from "./CacophonyApi";
import * as querystring from "querystring";
import { DeviceVisitMap } from "./visits";
import moment from "moment";

export default {
  query,
  queryVisits,
  queryCount,
  id,
  comment,
  del,
  tracks,
  addTrackTag,
  deleteTrackTag,
  replaceTrackTag,
  needsTag,
  makeApiQuery
};

export type DeviceId = number;
export type RecordingId = number;
export type TrackId = number;
export type TagId = number;
export type UserId = number;
export type TrackTagId = number;
export type GroupId = number;
export type JwtToken<T> = string;
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

export interface LimitedTrack {
  TrackId: TrackId;
  data: {
    start_s: number;
    end_s: number;
    positions: [Seconds, Rectangle][];
    num_frames: number;
  };
  tags: string[];
  needsTagging: boolean;
}

export interface TagLimitedRecording {
  RecordingId: RecordingId;
  DeviceId: DeviceId;
  tracks: LimitedTrack[];
  recordingJWT: JwtToken<Mp4File>;
  tagJWT: JwtToken<TrackTag>;
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
  createdAt?: UtcTimestamp;
  updatedAt?: UtcTimestamp;
  User?: User;
}

export interface LimitedTrackTag {
  TrackTagId: TrackTagId;
  what: string;
}

export interface Tag {
  what: string;
  confidence: number;
}

export interface QueryResultCount {
  count: number;
  success: boolean;
  messages: string[];
}

export interface QueryResult<T> {
  count: number;
  limit: string; // NOTE(jon): Actually, a number, but comes back as a string...
  messages: string[];
  offset: string; // NOTE(jon): Actually, a number, but comes back as a string...
  rows: T[];
  success: boolean;
}

// TODO: Unify this with the TagMode type in the API, extract both into a third Types/Interfaces repo.
export type TagMode =
  | "any"
  | "no-human"
  | "tagged"
  | "human-tagged"
  | "automatic-tagged"
  | "both-tagged"
  | "untagged";

type JsonString = string;

export interface RecordingQuery {
  tagMode?: TagMode;
  minS?: string;
  maxS?: string;
  tag?: string[] | string;
  limit?: number;
  offset?: number;
  days?: number | "all";
  from?: string;
  to?: string;
  group?: number[];
  device?: number[];
  type?: string;
  order?: any; // TODO - It's not clear what order accepts (it's a sequelize thing), but nobody seems to use it right now.
}

const apiPath = "/api/v1/recordings";

function query(
  queryParams: RecordingQuery
): Promise<FetchResult<QueryResult<RecordingInfo>>> {
  return CacophonyApi.get(
    `${apiPath}?${querystring.stringify(makeApiQuery(queryParams))}`
  );
}

function addIfSet(map: any, value: string, submap: string, key = "") {
  if (value && value.trim() !== "") {
    map[submap] = map[submap] || {};
    map[submap][key] = value;
  }
}

function makeApiQuery(query: RecordingQuery): any {
  const apiWhere = {};
  addIfSet(apiWhere, query.minS || "0", "duration", "$gte");
  addIfSet(apiWhere, query.maxS, "duration", "$lte");

  // Map between the mismatch in video type types between frontend and backend
  if (query.type === "video") {
    apiWhere["type"] = "thermalRaw";
  } else if (query.type !== "both") {
    apiWhere["type"] = query.type;
  }

  // Remove the group param, since the API doesn't handle that, we're just using
  // it to accurately share search parameters via urls.
  const hasDevices = query.hasOwnProperty("device") && query.device.length > 0;
  const hasGroups = query.hasOwnProperty("group") && query.group.length > 0;
  if (hasDevices && hasGroups) {
    apiWhere["$or"] = [{ DeviceId: query.device }, { GroupId: query.group }];
  } else if (hasGroups) {
    apiWhere["GroupId"] = query.group;
  } else if (hasDevices) {
    apiWhere["DeviceId"] = query.device;
  }

  let from = query.from;
  const until = query.to;
  if (query.hasOwnProperty("days") && query.days !== "all" && query.days) {
    // For the previous x days we want to do it at the time the submit is pressed and not cache it.
    // they could have had the window open for a few days.
    const now = new Date();
    from = moment(now)
      .add(-1 * query.days, "days")
      .format("YYYY-MM-DD HH:mm:ss");
  }
  addIfSet(apiWhere, from, "recordingDateTime", "$gt");
  addIfSet(apiWhere, until, "recordingDateTime", "$lt");

  const apiParams = {};
  const whereString = JSON.stringify(apiWhere);
  if (whereString.length > 2) {
    apiParams["where"] = whereString;
  }
  if (query.limit) {
    apiParams["limit"] = query.limit;
  }
  if (query.offset) {
    apiParams["offset"] = query.offset;
  }
  if (query.order) {
    apiParams["order"] = query.order;
  }
  if (query.tagMode) {
    apiParams["tagMode"] = query.tagMode;
  }
  if (query.tag && query.tag.length > 0) {
    if (typeof query.tag === "string") {
      query.tag = [query.tag];
    }
    apiParams["tags"] = JSON.stringify(query.tag);
  }

  return apiParams;
}

function queryVisits(
  queryParams: RecordingQuery
): Promise<FetchResult<QueryResult<DeviceVisitMap>>> {
  return CacophonyApi.get(
    `${apiPath}/visits?${querystring.stringify(makeApiQuery(queryParams))}`
  );
}

function queryCount(
  queryParams: RecordingQuery
): Promise<FetchResult<QueryResultCount>> {
  return CacophonyApi.get(
    `${apiPath}/count?${querystring.stringify(makeApiQuery(queryParams))}`
  );
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
  trackId: TrackId,
  tagJWT?: JwtToken<TrackTag>
): Promise<FetchResult<{ trackTagId: number; success: boolean }>> {
  const body: any = {
    what: tag.what,
    confidence: tag.confidence,
    automatic: false
  };
  if (tagJWT !== undefined) {
    body.tagJWT = tagJWT;
  }
  return CacophonyApi.post(
    `${apiPath}/${recordingId}/tracks/${trackId}/tags`,
    body
  );
}

function deleteTrackTag(
  tag: TrackTag,
  recordingId: RecordingId,
  tagJWT?: JwtToken<TrackTag>
): Promise<FetchResult<any>> {
  let requestUri = `${apiPath}/${recordingId}/tracks/${tag.TrackId}/tags/${tag.id}`;
  if (tagJWT !== undefined) {
    requestUri += `?tagJWT=${tagJWT}`;
  }
  return CacophonyApi.delete(requestUri);
}

interface RecordingToTag {
  id: RecordingId;
  deviceId: DeviceId;
  tracks: Track[];
}

function needsTag(biasToDeviceId?: DeviceId): Promise<RecordingToTag> {
  let requestUri = `${apiPath}/needs-tag`;
  if (biasToDeviceId != null) {
    requestUri += `?deviceId=${biasToDeviceId}`;
  }
  return CacophonyApi.get(requestUri);
}
