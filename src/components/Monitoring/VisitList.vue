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
      </span>
      {{ data.item.classificationAi }}
    </template>

    <template #cell(recordings)="data">
      {{ data.item.recordings.length }}
    </template>
  </b-table>
</template>

<script>
export default {
  name: "VisitList",
  props: {
    visits: {
      type:Array,
      required: true,
    },
  },
  methods: {
    makeFields() {
      return ["device", "station", "classification", "classificationAi", "timeStart", "timeEnd", "recordings"];
    },
  },
};
</script>
