<template>
  <div class="container">
    <div v-for="(item, index) in getMessages()" :key="index" class="row">
      <b-alert
        v-if="displayLevels.includes(item.level)"
        :variant="item.level"
        show
        dismissible
        @dismissed="acknowledgeMessages"
      >
        <div
          class="col-sm-11 offset-sm-1 col-md-7 offset-md-2 col-lg-4 offset-lg-4 box"
        >
          <icon-link :icon="['fas', 'exclamation-triangle']" :colour="'red'" />
          Oops! Something went wrong. <br />
          Message is: "{{ item.message }}"
        </div>
      </b-alert>
    </div>
  </div>
</template>

<script>
import IconLink from "./IconLink.vue";

export default {
  name: "GlobalMessaging",
  components: { IconLink },
  data: function() {
    return {
      displayLevels: ["warning", "danger"] // ['warning', 'danger', 'info', 'success']
    };
  },
  methods: {
    getMessages() {
      // TODO: Messaging is a little clunky - some ui love required
      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        () => this.$store.dispatch("Messaging/ACKNOWLEDGE"),
        10000
      );
      return this.$store.state.Messaging.messages;
    },
    acknowledgeMessages() {
      this.$store.dispatch("Messaging/ACKNOWLEDGE");
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
  transition: all 500ms ease-in;
  top: -100px;
}

.container:not(:empty) {
  transition: all 500ms ease-in;
  top: 0;
}

.alert {
  position: absolute;
  margin-bottom: 0;
  border-radius: 0;
  width: 100%;
  min-height: 100px;
}

.box {
  border: 1px;
}
</style>
