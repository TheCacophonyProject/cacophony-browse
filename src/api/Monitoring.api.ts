import CacophonyApi from "./CacophonyApi";
import * as querystring from "querystring";
import {
  calculateFromTime,
  FetchResult,
  RecordingQuery,
} from "./Recording.api";
import { shouldViewAsSuperUser } from "@/utils";

export class VisitSearchParams {
  all: boolean;
  devices: number[];
  groups: number[];
  compareAi: string;
  estimatedCount: number;
  pagesEstimate: number;
  page: number; // page we are on
  searchFrom: string; // original query from date
  searchUntil: string; // original query to date
  pageFrom: string; // visits for this page start after this date
  pageUntil: string; // visits for this page start before or on this date
}

interface VisitRecordingTag {
  aiTag: string;
  end: number;
  start: number;
  tag: string;
  isAITagged: boolean;
}

export class NewVisit {
  classFromUserTag?: boolean; // is the best guess derived from a user tag?
  classification?: string; // what was the best guess overall?
  classificationAi?: string; // what was the best guess from the AI?
  device: string;
  deviceId: number;
  stationId: number;
  station: string;
  tracks: number; // track count
  timeStart: string; // date for start of visit
  timeEnd: string; // date for start of visit
  incomplete: boolean; // is it possible that this visit still has more recordings that should be attached?
  recordings: { recId: number; start: string; tracks: VisitRecordingTag[] }[];
}

export interface NewVisitsQueryResult {
  statusCode: number;
  visits: NewVisit[];
  params: VisitSearchParams;
}

export interface NewVisitQuery {
  limit?: number;
  offset?: number;
  days?: number | "all";
  from?: string;
  to?: string;
  group?: number[];
  device?: number[];
}

const apiPath = "/api/v1/monitoring";

function queryVisitPage(
  visitQuery: RecordingQuery
): Promise<FetchResult<NewVisitsQueryResult>> {
  return CacophonyApi.get(
    `${apiPath}/page?${querystring.stringify(makeApiQuery(visitQuery))}${
      shouldViewAsSuperUser() ? "" : "&view-mode=user"
    }`
  );
}

function makeApiQuery(query: RecordingQuery) {
  const apiParams: any = {};

  addValueIfSet(apiParams, calculateFromTime(query), "from");
  addValueIfSet(apiParams, query.to, "until");
  addArrayValueIfSet(apiParams, query.group, "groups");
  addArrayValueIfSet(apiParams, query.device, "devices");
  apiParams["page-size"] = query.perPage || 10;
  apiParams.page = query.page || 1;

  return apiParams;
}

function addArrayValueIfSet(map: any, value: any[], key: string) {
  if (value && value.length > 0) {
    map[key] = value;
  }
}

function addValueIfSet(map: any, value: string, key: string) {
  if (value && value.trim() !== "") {
    map[key] = value;
  }
}

export default {
  queryVisitPage,
};
