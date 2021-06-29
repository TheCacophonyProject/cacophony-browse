import { NewVisit } from "@/api/Monitoring.api";

export class ClassificationCounter {
  userClassIndex: number;
  aiClassIndex: number;
  recIds: number[];
  count: number;
  otherClasses: string[];

  constructor(aUserClass: number, anAiClass: number) {
    this.userClassIndex = aUserClass;
    this.aiClassIndex = anAiClass;
    this.recIds = [];
    this.count = 0;
    this.otherClasses = [];
  }

  addVisit(visit: NewVisit) {
    this.count++;
    const recordingIds = visit.recordings.map((rec) => rec.recId);
    this.recIds.push(...recordingIds);
  }

  addOtherClass(className: string) {
    if (this.otherClasses.findIndex((name) => name === className) < 0) {
      this.otherClasses.push(className);
    }
  }

  static makeKey(index: number, aiIndex: number) {
    return `${index}-${aiIndex}`;
  }
}

export type AiCounters = { [key: string]: ClassificationCounter };

export interface AiConfusionMatrix {
  labels: string[];
  points: number[][];
  percentages: number[][];
  counters: AiCounters;
}

export function countByClassThenAiClass(
  visits: NewVisit[],
  allLabels: string[],
  otherLabel: string
): AiConfusionMatrix {
  const otherIndex = allLabels.findIndex((label) => label === otherLabel);

  const counters = visits.reduce((acc: AiCounters, visit: NewVisit) => {
    const classi = visit.classification || "none";
    const aiClassi = visit.classificationAi || "none";
    const index = findLabelIndex(classi, allLabels, otherIndex);
    const aiIndex = findLabelIndex(aiClassi, allLabels, otherIndex);

    const key = ClassificationCounter.makeKey(index, aiIndex);

    const counter = acc[key] || new ClassificationCounter(index, aiIndex);
    counter.addVisit(visit);
    if (aiIndex == otherIndex) {
      counter.addOtherClass(aiClassi);
    }
    acc[key] = counter;
    return acc;
  }, {});

  const points: number[][] = [];
  const rowCounts: number[] = new Array(allLabels.length).fill(0);

  for (const counter of Object.values(counters)) {
    points.push([counter.aiClassIndex, counter.userClassIndex, counter.count]);

    rowCounts[counter.userClassIndex] += counter.count;
  }

  const percentages: number[][] = [];
  for (const counter of Object.values(counters)) {
    const percent = counter.count / rowCounts[counter.userClassIndex];
    percentages.push([counter.aiClassIndex, counter.userClassIndex, percent]);
  }

  return {
    labels: allLabels,
    points,
    percentages,
    counters,
  };
}

function findLabelIndex(
  value: string,
  allLabels: string[],
  defaultValue: number
): number {
  let index = allLabels.findIndex((label) => label === value);
  if (index < 0) {
    index = defaultValue;
  }
  return index;
}
