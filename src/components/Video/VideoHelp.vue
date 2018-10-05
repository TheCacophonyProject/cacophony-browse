<template>
  <div>
    <h3>Help</h3>
    <b-row>
      <b-col cols="5">
        <font-awesome-icon 
          class="fa-fw"
          icon="angle-left" 
          size="2x" />
        <font-awesome-icon 
          class="fa-fw"
          icon="angle-right"
          size="2x" />
      </b-col>
      <b-col cols="7">
        <p class="col-xs-6">Move between recordings for device</p>
      </b-col>
      <b-col cols="5">
        <font-awesome-icon
          icon="question"
          style="color: green"
          transform="up-16 shrink-7"
          value="?" />
        <font-awesome-icon
          class="fa-2x"
          icon="angle-left"
          transform="left-5" />
        <font-awesome-icon
          class="fa-2x"
          icon="angle-right"
          transform="right-5" />
        <font-awesome-icon
          icon="question"
          style="color: green"
          transform="up-16 shrink-7"
          value="?" />
      </b-col>
      <b-col cols="7">
        <p class="col-xs-6">Move between recordings for device which have not been manually tagged</p>
      </b-col>
      <b-col cols="5">
        <font-awesome-icon
          icon="asterisk"
          style="color: red"
          transform="up-16 shrink-7"
          value="?" />
        <font-awesome-icon
          class="fa-2x"
          icon="angle-double-left"
          transform="left-5" />
        <font-awesome-icon
          class="fa-2x"
          icon="angle-double-right"
          transform="right-5" />
        <font-awesome-icon
          icon="asterisk"
          style="color: red"
          transform="up-16 shrink-7"
          value="?" />
      </b-col>
      <b-col cols="7">
        <p class="col-xs-6">Move between 'interesting' tagged recordings for device where the first tag is not a a bird or false/positive</p>
      </b-col>
    </b-row>
  </div>
</template>

<script>

export default {
  name: 'VideoHelp'
};
</script>

<style scoped>
.col-5 {
  text-align: center;
}
.fa-fw {
  box-sizing: border-box;
  opacity: 0.6;
}
</style>
