import * as moment from "moment";

export class VisitEvent {
  wasUnidentified: Boolean;
  recID: number;
  recStart: moment.Moment;
  trackID: number;
  trackNumber: number;
  confidence: number;
  start: moment.Moment;
  end: moment.Moment;
  audioBaitDay: boolean;
  audioBaitVisit: boolean;
  audioBaitEvents: Event[];
}

export class Visit {
  visitID: number;
  events: VisitEvent[];
  what: string;
  end: moment.Moment;
  start: moment.Moment;
  device: string;
  audioBaitDay: boolean;
  audioBaitEvents: Event[];
  audioBaitVisit: boolean;
}

export class Event {
  dateTime: Date;
  EventDetailId: number;
  EventDetail: any;
  DeviceId: number;
  fileName: string;
}

export class VisitSummary {
  visits: Visit[];
  end: moment.Moment;
  start: moment.Moment;
}
export interface AnimalMap {
  [key: string]: VisitSummary;
}
export class DeviceVisits {
  animals: AnimalMap;
  lastVisit: Visit;
}
export interface DeviceVisitMap {
  [key: number]: DeviceVisits;
}

export class DayVisits {
  day: moment.Moment;
  visitsByHour: HourVisits[];
  audioBaitDay: boolean;
  currentHour: HourVisits;
  constructor(visit: Visit) {
    this.day = moment(visit.end);
    this.audioBaitDay = visit.audioBaitDay;
    this.visitsByHour = [];
    this.addVisit(visit);
  }

  public relativeDay(): string {
    return this.day.format("YYYY-MM-DD");
  }

  public isSameDay(visit: Visit): boolean {
    return this.day.isSame(moment(visit.end), "day");
  }

  public addVisit(visit: Visit) {
    if (this.currentHour && this.currentHour.isSameHour(visit)) {
      this.currentHour.addVisit(visit);
    } else {
      this.currentHour = new HourVisits(visit);
      this.visitsByHour.push(this.currentHour);
    }
  }
}

export class HourVisits {
  visits: Visit[];
  hour: moment.Moment;
  constructor(visit: Visit) {
    this.visits = [visit];
    this.hour = moment(visit.end);
  }

  public getHour(): string {
    return this.hour.format("ha");
  }
  public isSameHour(visit: Visit): boolean {
    return this.hour.isSame(visit.end, "hour");
  }
  public addVisit(visit: Visit) {
    this.visits.push(visit);
  }
}
