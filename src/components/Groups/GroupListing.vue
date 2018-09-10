<template>
  <div>

    <spinner :fetching="!fetched"/>

    <p v-if="!groups.length">You currently aren't a member of any groups</p>

    <div
      v-for="(group, index) in groups"
      :key="index"
      class="group">

      <div class="header">

        <h4>{{ group.groupname }}</h4>

        <b-link
          :to="{ name: 'group', params: { groupname: group.groupname }}"
          class="show-button">
          <font-awesome-icon
            :icon="['far', 'caret-square-right']"
            size="2x"
            style="cursor: pointer;"/>
        </b-link>

      </div>
    </div>
  </div>
</template>

<script>

import {mapState} from 'vuex';
import Spinner from '../Spinner.vue';

export default {
  name: "GroupListing",
  components: {Spinner},
  computed: mapState({
    groups: state => state.Groups.groups,
    fetched: state => state.Groups.fetched
  })
};
</script>

<style scoped>

  h4 {
    margin-top: 0.75rem;
    font-size: 1rem;
  }

  .show-button {
    display: flex;
    margin-left: auto;

  }

  .group {
    padding: 0.75rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
  }

</style>
