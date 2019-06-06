
const DefaultLabels = {
  labels: [
    {value: "bad track", text: 'poor tracking'},   
    {value: "other"},
    {value: "interesting"},
  ],
  animals: [
    {value: "possum"},
    {value: "rodent", text: 'rat or mouse'},
    {value: "mustelid", text: 'stoat, weasel or ferret (mustelid)'},
    {value: "hedgehog"},
    {value: "cat"},
    {value: "bird"},
    {value: "bird/kiwi"},
    {value: "dog"},
    {value: "Leporidae", text: "hare or rabbit (leporidae)"},
    {value: "human"},
    {value: "insect", text: 'spider or insect (on camera lens or flying)'},
    {value: "spider"},
    {value: "unidentified"},
    {value: "pest", text: 'unidentified animal but not bird'},
    {value: "part", text: 'part of animal (eg tail)'},
  ],
  recordingLabels: [
    {value: "missed track", text: 'Missed animal track'},
    {value: "multiple animals", text: 'Multiple animals in video'},
    {value: "trapped in trap", text: 'Animal in trap'},
    {value: "cool", text: 'Cool video'},
    {value: "animal", text: 'Untracked animal (please specify animal)'},
    "other"
  ],
  searchLabels: function () {
    return this.animals.concat(this.labels);
  },
  trackLabels: function () {
    var extraLabels = this.labels.slice(0,2);
    return this.animals.concat(extraLabels);
  },
};

export default DefaultLabels;