var allLabels = {
  badTrack: {
    value: "bad track",
    text: 'poor tracking'
  },
  other: {
    value: "other",
    text: "other"
  },
  interesting: {
    value: "interesting",
    text: "interesting"
  },
  possum: {
    value: "possum",
    text: "possum"
  },
  rodent: {
    value: "rodent",
    text: 'rat or mouse'
  },
  mustelid: {
    value: "mustelid",
    text: 'stoat, weasel or ferret (mustelid)'
  },
  hedgehog: {
    value: "hedgehog",
    text: "hedgehog"
  },
  cat: {
    value: "cat",
    text: "cat"
  },
  bird: {
    value: "bird",
    text: "bird"
  },
  kiwi: {
    value: "bird/kiwi",
    text: "bird/kiwi"
  },
  dog: {
    value: "dog",
    text: "dog"
  },
  leporidae: {
    value: "leporidae",
    text: "hare or rabbit (leporidae)"
  },
  human: {
    value: "human",
    text: "human"
  },
  insect: {
    value: "insect",
    text: 'spider or insect (on camera lens or flying)'
  },
  unidentified: {
    value: "unidentified",
    text: "unidentified"
  },
  pest: {
    value: "pest",
    text: 'unidentified animal but not bird'
  },
  part: {
    value: "part",
    text: 'part of animal (eg tail)'
  },
  missedTrack: {
    value: "missed track",
    text: 'Missed animal track'
  },
  multipleAnimals: {
    value: "multiple animals",
    text: 'Multiple animals in video'
  },
  inTrap: {
    value: "trapped in trap",
    text: 'Animal in trap'
  },
  cool: {
    value: "cool",
    text: 'Cool video'
  },
  animal: {
    value: "animal",
    text: 'Untracked animal (please specify animal)'
  },
  any: {
    value: 'any',
    text: 'all'
  },
  noHuman: {
    value: 'no-human',
    text: 'not tagged by human'
  },
  tagged: {
    value: 'tagged',
    text: 'tagged as...'
  },
  humanTagged: {
    value: 'human-tagged',
    text: 'human tagged as...'
  },
  automaticTagged: {
    value: 'automatic-tagged',
    text: 'AI tagged as...'
  },
  bothTagged: {
    value: 'both-tagged',
    text: 'AI and human tagged as...'
  },
  unTagged: {
    value: 'untagged',
    text: 'untagged only'
  },
};

const DefaultLabels = {
  animals: [
    allLabels.possum,
    allLabels.rodent,
    allLabels.mustelid,
    allLabels.hedgehog,
    allLabels.cat,
    allLabels.bird,
    allLabels.kiwi,
    allLabels.dog,
    allLabels.leporidae,
    allLabels.human,
    allLabels.insect,
    allLabels.unidentified,
    allLabels.pest,
    allLabels.part,
  ],
  recordingLabels: [
    allLabels.missedTrack,
    allLabels.multipleAnimals,
    allLabels.inTrap,
    allLabels.cool,
    allLabels.animal,
    allLabels.other,
  ],
  tagTypes: [
    allLabels.any,
    allLabels.noHuman,
    allLabels.tagged,
    allLabels.humanTagged,
    allLabels.automaticTagged,
    allLabels.bothTagged,
    allLabels.unTagged,
  ],
  quickTagLabels: function() {
    return [allLabels.possum.value, allLabels.rodent.value, allLabels.hedgehog.value, allLabels.cat.value, allLabels.bird.value];
  },
  searchRecordingLabels: function() {
    return this.tagTypes.concat([allLabels.missedTrack,
      allLabels.multipleAnimals,
      allLabels.inTrap,
      allLabels.cool
    ]);
  },
  searchLabels: function() {
    var searchLabels = this.animals.concat([allLabels.badTrack,
      allLabels.other
    ]);
    searchLabels.splice(0, 0, allLabels.interesting);
    return searchLabels;
  },
  trackLabels: function() {
    return this.animals.concat([allLabels.badTrack, allLabels.other]);
  },
  canHaveSpecifiedTags: function(tagType) {
    switch (tagType) {
    case allLabels.tagged.value:
    case allLabels.humanTagged.value:
    case allLabels.automaticTagged.value:
    case allLabels.bothTagged.value:
    case allLabels.cool.value:
    case allLabels.multipleAnimals.value:
    case allLabels.inTrap.value:
    case allLabels.missedTrack.value:
      return true;
    default:
      return false;
    }
  },
};

export default DefaultLabels;