<template>
  <b-table striped hover :items="visits" :fields="makeFields()">
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
      return ["device.devicename", "what", "isUserTagged", "aiWhat", "start", "end", "recordings"];
    },
  },
};
</script>
