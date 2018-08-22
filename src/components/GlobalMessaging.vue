<template>
  <div class="container">
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
      return this.getMessages();
    }
  },
  methods: {
    getMessages() {
      // TODO: Messaging is a little clunky - some ui love required
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.$store.dispatch('Messaging/ACKNOWLEDGE'), 2000);
      return this.$store.state.Messaging.messages;
    },
    acknowledgeMessages() {
      this.$store.dispatch('Messaging/ACKNOWLEDGE');
    }
  }
};
</script>

<style scoped>
  .container {
    position: fixed;
    width: 100%;
    z-index: 1000;
    left: 0;
    right: 0;
    max-width: 100000px;
    padding: 0;
    box-shadow: black;
    transition:all 500ms ease-in;
    top: -100px;
  }

  .container:not(:empty){
    transition:all 500ms ease-in;
    top: 0;
  }

  .alert {
    position: absolute;
    margin-bottom: 0;
    border-radius: 0;
    width: 100%;
    min-height: 100px;
  }
</style>
