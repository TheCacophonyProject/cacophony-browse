<template>
  <div class="mt-5">

    <b-button-group>
      <b-btn
        v-for="(date, index) in dates"
        :key="index"
        :variant="variant(date.value)"
        active
        @click="$emit('input', date.value)">
        {{ date.text }}
      </b-btn>
    </b-button-group>

    <b-btn
      variant="success"
      @click="$emit('update')">
      Update Graph
    </b-btn>
  </div>
</template>

<script>

export default {
  name: 'DateRange',
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  data: function () {
    return {
      dates: [
        {text: 'Last 7 Days', value: 7},
        {text: 'Last 30 Days', value: 30},
        {text: 'Last 60 Days', value: 60},
        {text: 'Last 365 Days', value: 365}
      ]
    };
  },
  methods: {
    variant(buttonValue) {
      if (buttonValue === this.value) {
        return 'primary';
      } else {
        return 'secondary';
      }
    }
  }
};
</script>
