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
  estimatedCount: number;
  estimatedPages: number;
  page: number; // page we are on
  from: string; // original query from date
  until: string; // original query to date
  pageFrom: string; // visits for this page start after this date
  pageTo: string; // visits for this page start before or on this date
}

export class NewVisit {
  aiWhat?: string; // what was the best guess from the AI?
  what?: string; // what was the best guess overall?
  isUserTagged: boolean; // is the best guess derived from a user tag?
  start: string; // date for start of visit
  end: string; // date for start of visit
  incomplete: boolean; // is it possible that this visit still has more recordings that should be attached?
  recordings: any[];
}

export interface NewVisitsQueryResult {
  statusCode: number;
  visits: NewVisit[];
  params: VisitSearchParams;
}

export interface NewVisitQuery {
  perPage?: number;
  page?: number;
  days?: number | "all";
  from?: string;
  to?: string;
  group?: number[];
  device?: number[];
  aiModel?: string;
}

export interface AIVisitsForStats {
  totalVisits: number;
  labelledVisits: NewVisit[];
  all: boolean;
}

const apiPath = "/api/v1/monitoring";

function queryVisitPage(
  visitQuery: NewVisitQuery
): Promise<FetchResult<NewVisitsQueryResult>> {
  return CacophonyApi.get(
    `${apiPath}/page?${querystring.stringify(makeApiQuery(visitQuery))}${
      shouldViewAsSuperUser() ? "" : "?view-mode=user"
    }`
  );
}

async function getAllVisits (
  visitQuery: NewVisitQuery, visitsFilter?: (NewVisit) => boolean, progress?:(number) => void 
) : Promise<AIVisitsForStats> {
  let statVisits : NewVisit[] = [];
  let allVisitsCount = 0;
  let more = true;
  let request = 0;
  let nextRequestQuery = visitQuery;
  let pages = 0;
  nextRequestQuery.perPage = 100;
  nextRequestQuery.page = 1;
  while (more && request < 100) {
    request++;
    const response = await queryVisitPage(nextRequestQuery);
    // what if failed???
    allVisitsCount += response.result.visits.length;
    if (visitsFilter) {
      let filteredVisits = response.result.visits.filter(visitsFilter); 
      statVisits = [...statVisits, ...filteredVisits];
    } else {
      statVisits = [...statVisits, ...response.result.visits];
    }

    more = response.result.params.pagesEstimate != 1;
    if (progress) {
      progress(pages / (pages + response.result.params.pagesEstimate));
      pages += 1;
    }

    if (more) {
      nextRequestQuery = {
        perPage: 100,
        page: 1,
        from: response.result.params.searchFrom,
        to: response.result.params.pageFrom,
        group: response.result.params.groups,
        device: response.result.params.devices,
      }
    }
  }
  return {
    totalVisits: allVisitsCount, 
    labelledVisits: statVisits,
    all: !more
  }
}

function makeApiQuery(query: NewVisitQuery) {
  const apiParams: any = {};

  addValueIfSet(apiParams, calculateFromTime(query), "from");
  addValueIfSet(apiParams, query.to, "until");
  addValueIfSet(apiParams, query.aiModel, "ai");
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
  getAllVisits,
};
