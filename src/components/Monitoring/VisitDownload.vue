<template>
  <b-button
    type="submit"
    variant="secondary"
    class="btn-sm"
    @click="click"
    data-cy="export"
  >
    <font-awesome-icon icon="download" class="fa-1x" />
    Export
  </b-button>
</template>

<script>
import api from "../../api/index";
import { toNZDateString } from "@/helpers/datetime";

export default {
  name: "VisitDownload",
  props: {
    params: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      queryPending: false,
    }
  },
  methods: {
    async click() {
      this.queryPending = true;
      // Call API and process results
      const results = await api.monitoring.getAllVisits(this.params);
      const rows = results.filteredVisits.map((visit) => [
        visit.stationId ? visit.station : visit.device,
        formatDate(visit.timeStart),
        formatDate(visit.timeEnd),
        visit.classification,
        visit.classificationAi,
        visit.classFromUserTag,
        chooseSpecies(visit.classification),
        "cacophony",
        visit.classFromUserTag ? "User tagged : " : "AI tagged: " + visit.classification,
      ]);
      const header = "station,start_date,end_date,class,ai_class,is_ai_tagged,species,recorded_by,notes\n";
      const csvVisits = rows.map(e => e.join(",")).join("\n");
      this.createExport(header + csvVisits);
    },
    createExport(csvFormattedString) {
      var blob = new Blob([csvFormattedString], { type: 'text/csv;charset=utf-8;' });
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "visits.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  },
};

const TRAP_NZ_SPECIES = [
 "rodent",
 "none", 
 "lizard",
 "unspecified",
 "rat",
 "mouse",
 "ferret",
 "stoat",
 "weasel",
 "rabbit",
 "hedgehog",
 "possum",
 "insect",
 "weta",
 "bird",
 "magpie",
 "cat",
 "dog",
 "other"
];

function formatDate(value) {
  const date = new Date(value);
  return `${toNZDateString(date)} ${date.toTimeString().substring(0, 8)}`;
};

function chooseSpecies(classification) {
  const classLower = classification.toLowerCase();
  return (TRAP_NZ_SPECIES.indexOf(classLower) >= 0) ? classLower : "other";
}
</script>