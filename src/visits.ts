import * as moment from "moment";

import { RecordingInfo, Track, TrackTag } from "./api/Recording.api";
import { allLabels } from "./const";
let visitID = 1;

interface DeviceVisitMap {
  [key: number]: DeviceVisits;
}

interface AnimalMap {
  [key: string]: VisitSummary;
}

const eventMaxTimeSeconds = 60 * 10;

function getTrackTag(trackTags: TrackTag[], userID: number): TrackTag {
  if (!trackTags || trackTags.length == 0) {
    return null;
  }
  const manualTags = trackTags.filter(tag => tag.automatic == false);
  if (manualTags.length > 0) {
    const userTag = manualTags.find(tag => tag.UserId == userID);
    if (userTag) {
      return userTag;
    } else {
      return manualTags[0];
    }
  }
  return trackTags[0];
}

class DeviceVisits {
  animals: AnimalMap;
  lastVisit: Visit;
  constructor(
    public deviceName: string,
    public id: number,
    public userID: number
  ) {
    this.animals = {};
    this.lastVisit = null;
  }

  calculateTrackVisits(rec: RecordingInfo): Visit[] {
    const visits = [];
    for (const trackKey in rec.Tracks) {
      const track = rec.Tracks[trackKey];
      const visit = this.calculateTrackTagVisit(rec, track);
      if (visit) {
        visits.push(visit);
      }
    }
    return visits;
  }

  calculateTrackTagVisit(rec: RecordingInfo, track: Track): Visit {
    const tag = getTrackTag(track.TrackTags, this.userID);
    if (!tag) {
      return;
    }
    const trackPeriod = new TrackStartEnd(rec, track);
    if (tag.what == allLabels.unidentified.value) {
      if (
        this.lastVisit &&
        this.lastVisit.isPartOfVisit(trackPeriod.trackEnd)
      ) {
        console.log(
          trackPeriod.trackEnd.format("LLL") +
            " unidentified part of prev visit of" +
            this.lastVisit.what +
            " start at" +
            this.lastVisit.start.format("LLL")
        );
        this.lastVisit.addEvent(
          rec,
          track,
          tag,
          this.lastVisit.what != tag.what
        );
        return;
      }
    }
    return this.handleTag(rec, track, tag, trackPeriod);
  }

  handleTag(
    rec: RecordingInfo,
    track: Track,
    tag: TrackTag,
    trackPeriod: TrackStartEnd
  ): Visit {
    const visitSummary = this.animals[tag.what];

    if (
      visitSummary &&
      visitSummary.lastVisit().isPartOfVisit(trackPeriod.trackEnd)
    ) {
      visitSummary.addEventToLastVisit(rec, track, tag);
    } else {
      return this.addVisit(rec, track, tag);
    }
  }

  addVisit(rec: RecordingInfo, track: Track, tag: TrackTag): Visit {
    let visitSummary = this.animals[tag.what];

    if (!visitSummary) {
      visitSummary = new VisitSummary(tag.what);
      this.animals[tag.what] = visitSummary;
    }
    const visit = visitSummary.addVisit(rec, track, tag);

    if (tag.what != allLabels.unidentified.value) {
      this.recheckUnidentified(visit);
    }
    this.lastVisit = visit;
    return visit;
  }

  recheckUnidentified(visit: Visit) {
    const unVisit = this.lastVisit;
    if (unVisit && unVisit.what == allLabels.unidentified.value) {
      let unEvent = unVisit.events[0];
      let insertIndex = 1;
      while (unEvent && visit.isPartOfVisit(unEvent.end)) {
        unEvent.wasUnidentified = true;
        visit.addEventAtIndex(unEvent, insertIndex);
        unVisit.removeEventAtIndex(0);

        insertIndex += 1;
        unEvent = unVisit.events[0];
      }

      if (unVisit.events.length == 0) {
        const unVisitSummary = this.animals[allLabels.unidentified.value];
        unVisitSummary.removeVisitAtIndex(0);
      }
    }
  }
}

class VisitSummary {
  visits: Visit[];
  end: moment.Moment;
  start: moment.Moment;
  constructor(public what: string) {
    this.visits = [];
  }

  lastVisit(): Visit {
    return this.visits[0];
  }

  addEventToLastVisit(
    rec: RecordingInfo,
    track: Track,
    tag: TrackTag,
    wasUnidentified: boolean = false
  ) {
    //add event to current visit
    const lastVisit = this.lastVisit();
    const event = lastVisit.addEvent(rec, track, tag, wasUnidentified);
    if (!wasUnidentified) {
      this.start = event.end;
    }
  }

  removeVisitAtIndex(index: number) {
    this.visits.splice(index, 1);
  }

  addVisit(rec: RecordingInfo, track: Track, tag: TrackTag): Visit {
    visitID += 1;
    const visit = new Visit(rec, track, tag, visitID);
    this.visits.splice(0, 0, visit);
    this.start = visit.end;
    if (this.visits.length == 1) {
      this.end = visit.start;
    }
    return visit;
    // if (visit.what != DefaultLabels.allLabels.unidentified.value) {
    //   this.recheckUnidentified(devVisits, visit);
    // }
    // devVisits.lastVisit = visit;
    // visits.push(visit);
    // return visit;
  }
}

class Visit {
  events: VisitEvent[];
  what: string;
  end: moment.Moment;
  start: moment.Moment;
  device: string;
  constructor(
    rec: RecordingInfo,
    track: Track,
    tag: TrackTag,
    public visitID: number
  ) {
    const event = new VisitEvent(rec, track, tag);
    this.events = [event];
    this.what = tag.what;
    this.end = event.end;
    this.start = event.start;
    this.device = rec.Device.devicename;
  }
  removeEventAtIndex(index: number) {
    this.events.splice(index, 1);
  }

  addEventAtIndex(newEvent: VisitEvent, index: number) {
    this.events.splice(index, 0, newEvent);
  }

  isPartOfVisit(eTime: moment.Moment): boolean {
    const secondsDiff = Math.abs(this.start.diff(eTime, "seconds"));
    return secondsDiff <= eventMaxTimeSeconds;
  }

  eventIsPartOfVisit(newEvent: VisitEvent): boolean {
    return this.isPartOfVisit(newEvent.end);
  }

  addEvent(rec, track, tag, wasUnidentified: boolean = false): VisitEvent {
    const event = new VisitEvent(rec, track, tag);
    event.wasUnidentified = wasUnidentified;
    this.events.splice(0, 0, event);
    if (!event.wasUnidentified) {
      this.start = event.start;
    }
    return event;
  }
}

class VisitEvent {
  wasUnidentified: Boolean;
  recID: number;
  recStart: moment.Moment;
  trackID: number;
  confidence: number;
  start: moment.Moment;
  end: moment.Moment;
  constructor(rec: RecordingInfo, track: Track, tag: TrackTag) {
    const trackTimes = new TrackStartEnd(rec, track);

    this.wasUnidentified = false;
    this.recID = rec.id;
    this.recStart = trackTimes.recStart;
    this.trackID = track.id;
    this.confidence = tag.confidence;
    this.start = trackTimes.trackStart;
    this.end = trackTimes.trackEnd;
  }
}

class TrackStartEnd {
  recStart: moment.Moment;
  trackStart: moment.Moment;
  trackEnd: moment.Moment;
  constructor(rec: RecordingInfo, track: Track) {
    this.recStart = moment(rec.recordingDateTime);
    if (track.data) {
      this.trackStart = this.recStart.add(
        track.data.start_s * 1000,
        "milliseconds"
      );
      this.trackEnd = this.recStart.add(
        track.data.end_s * 1000,
        "milliseconds"
      );
    } else {
      this.trackStart = this.recStart;
      this.trackEnd = this.recStart;
    }
  }
}
export {
  DeviceVisitMap,
  DeviceVisits,
  VisitSummary,
  Visit,
  VisitEvent,
  TrackStartEnd
};
