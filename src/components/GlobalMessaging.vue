<template>
  <div>
    <div
      v-for="(item, index) in messages"
      :key="index">
      <b-alert
        :variant="item.level"
        show
        dismissible
        @dismissed="acknowledgeMessages">
        {{ item.message }}
      </b-alert>
    </div>
  </div>
</template>

<script>
export default {
  name: "GlobalMessaging",
  computed: {
    messages() {
      return this.$store.state.Messaging.messages;
    }
  },
  methods: {
    acknowledgeMessages() {
      this.$store.dispatch('Messaging/ACKNOWLEDGE');
    }
  }
};
</script>

<style scoped>
  .alert {
    margin-bottom: 0;
    border-radius: 0;
  }
</style>
