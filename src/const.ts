import { BIconAlarmFill } from "bootstrap-vue";

var allLabels = {};

export class TrackLabel {
  value: string;
  text:  string;
  includes: TrackLabel[];
  allIncludedTags: string[];

  constructor(parent: TrackLabel, name: string, dbLabel?: string, description: string = null){
    this.value = dbLabel ? dbLabel : name;
    this.text = description ? description : this.value;
    this.includes = [];
    this.allIncludedTags = [this.value];

    if (parent) {
      parent.addChild(this);
    }    

    allLabels[name] = this;
  }

  addChild(child: TrackLabel) {
    this.includes.push(child);
    this.allIncludedTags.push(child.value);
  }
}

const nomenclatureBase =  new TrackLabel(null, "base");

const things = new TrackLabel(nomenclatureBase, "things");
const notKnown = new TrackLabel(nomenclatureBase, "notKnown", "not known");
const nothing = new TrackLabel(nomenclatureBase, "nothing");
const descriptors = new TrackLabel(nomenclatureBase, "descriptors");

const allBirds = new TrackLabel(things, "allbirds", "allbirds", "any type of bird");
const bird = new TrackLabel(allBirds, "bird");
const kiwi = new TrackLabel(allBirds, "bird/kiwi");
  
const pest = new TrackLabel(things, "pest", "pest", "One of our target pest species");
const possum = new TrackLabel(pest, "possum");
const rodent = new TrackLabel(pest, "rodent", "rodent", "rat or mouse");
new TrackLabel(pest, "mustelid", "mustelid", "stoat, weasel or ferret (mustelid)");
const hedgehog = new TrackLabel(pest, "hedgehog");
const cat =new TrackLabel(pest, "cat");
  
new TrackLabel(things, "dog");
new TrackLabel(things,"leporidae", "leporidae", "hare or rabbit (leporidae)");
const wallaby = new TrackLabel(things,"wallaby");
new TrackLabel(things,"pig");
new TrackLabel(things,"human");
new TrackLabel(things,"insect", "insect", "spider or insect (on camera lens or flying)");
new TrackLabel(things,"penguin");
new TrackLabel(things,"sealion");
new TrackLabel(things,"deer");
new TrackLabel(things,"goat");
new TrackLabel(things, "vehicle");
const other = new TrackLabel(things, "other");
  
const part = new TrackLabel(descriptors, "part", "part", "part of animal (eg tail)");
const poorTracking = new TrackLabel(descriptors, "poorTracking", "poor tracking");
const interesting = new TrackLabel(descriptors,"interesting");
  
const falsePositive = new TrackLabel(nothing, "falsePositive", "false-positive");
new TrackLabel(nothing, "none");

new TrackLabel(notKnown, "unidentified");
const unknown = new TrackLabel(notKnown, "unknown", "not identifiable");


// specified means - can have another specified tag in the search (eg Possum)
const recordingLabelsBase = [
  {
    value: "missed track",
    text: "Missed animal track",
    specified: true,
  },
  {
    value: "missed recording",
    text: "Missed recording (before this one)",
    specified: false,
  },
  {
    value: "multiple animals",
    text: "Multiple animals in video",
    specified: true,
  },
  {
    value: "trapped in trap",
    text: "Animal in trap",
    specified: true,
  },
  {
    value: "interaction with trap",
    text: "Animal interacted with trap",
    specified: true,
  },
  {
    value: "cool",
    text: "Cool video",
    specified: true,
  }
];

const taggingFilters = [
  {
    value: "any",
    text: "all",
    specified: false,
  },
  {
    value: "no-human",
    text: "not tagged by human",
    specified: false,
  },
  {
    value: "tagged",
    text: "tagged as...",
    specified: true,
  },
  {
    value: "human-tagged",
    text: "Human tagged as...",
    specified: true,
  },
  {
    value: "automatic-tagged",
    text: "AI tagged as...",
    specified: true,
  },
  {
    value: "both-tagged",
    text: "AI and human tagged as...",
    specified: true,
  },
  {
    value: "untagged",
    text: "untagged only",
    specified: false,
  },
];

const DefaultLabels = {
  trackLabelsBase: [...pest.includes,
    ...allBirds.includes,
    pest,
    ...things.includes,
    unknown, 
    part, 
    poorTracking, 
    other],
  tagTypes: [...taggingFilters],
  allLabels: allLabels,
  otherTagLabels: function () {
    return [unknown, falsePositive];
  },
  quickTagLabels: function () {
    return [
      possum.value,
      rodent.value,
      hedgehog.value,
      cat.value,
      bird.value,
    ];
  },
  wallabyQuickTagLabels: function () {
    return [
      wallaby.value,
      possum.value,
      rodent.value,
      cat.value,
      bird.value,
    ];
  },
  recordingLabels: function () {
    return [...recordingLabelsBase];
  },
  searchRecordingLabels: function () {
    return [...recordingLabelsBase, ...taggingFilters];
  },
  searchLabels: function () {
    return [
      interesting, 
      ...this.trackLabelsBase];
  },
  trackLabels: function () {
    debugger;
    return [...this.trackLabelsBase];
  },
  canHaveSpecifiedTags: function (tagType) {
    return DefaultLabels.searchRecordingLabels().filter(tag => {
      tag.specified && tag.value === tagType;
    }).length > 0;
  },
  overViewAiEvaluationMatrix: function () {
    return [ 
      bird, 
      pest, 
    ];
  },
  detailedAiEvaluationMatrix: function () {
    return [
      bird,
      ...pest.includes,
      wallaby,
      nothing,
      notKnown,
    ];
  },
  falsePositiveLabel: falsePositive,
  birdLabel: bird,
  unknownLabel: unknown, 
  unidentifiedLabel: undefined
};

export const TagColours = [
  "yellow",
  "orange",
  "red",
  "purple",
  "lightblue",
  "limegreen",
  "black",
  "white",
];

function imgSrc(what) {
  let image = null;
  if (what == kiwi.value) {
    image = "kiwi.png";
  } else {
    image = what + ".png";
  }
  return "/" + image;
}

export { allLabels, imgSrc };
export default DefaultLabels;

export const WALLABY_GROUP = 160;
