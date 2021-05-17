<template>
  <b-table striped hover :items="visits" :fields="makeFields()">
    <template #cell(classification)="data">
      <span v-if="data.item.classFromUserTag">
        <font-awesome-icon icon="user" size="xs" />
        &nbsp;
      </span>
      {{ data.item.classification }}
    </template>

    <template #cell(classificationAi)="data">
      <span v-if="data.item.classFromUserTag">
        <span v-if="data.item.classificationAi === data.item.classification">
          <font-awesome-icon icon="thumbs-up" size="xs" />
        </span>
        <span v-else>
          <font-awesome-icon icon="thumbs-down" size="xs" />
        </span>
        &nbsp;
      {{ data.item.classificationAi }}
      </span>
    </template>
   
    <template #cell(timeStart)="data">
      {{ formatDate(data.value) }}
    </template>

    <template #cell(timeEnd)="data">
      {{ formatDate(data.value) }}
    </template>

    <template #cell(recordings)="data">
      {{ data.item.recordings.length }}
    </template>
  </b-table>
</template>

<script>
import {
  toNZDateString,
} from "@/helpers/datetime";

export default {
  name: "VisitList",
  props: {
    visits: {
      type: Array,
      required: true,
    },
  },
  methods: {
    makeFields() {
      return [
        "device",
        "station",
        { key: "classification", label: "Class"},
        { key: "classificationAi", label: "AI Class"},
        "timeStart",
        "timeEnd",
        "recordings",
      ];
    },
    formatDate(value) {
      const date = new Date(value);
      return `${toNZDateString(date)} ${date.toTimeString().substring(0, 5)}`;
    }
  },
};
</script>
