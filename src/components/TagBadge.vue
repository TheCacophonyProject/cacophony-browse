<template>
  <span
    v-b-tooltip="getTagTitle(tag.class)"
    :class="[
      'tag',
      'badge',
      tag.class
    ]"
  >
    <span
      class="tag-icon">
      <font-awesome-icon
        v-if="tag.class === 'automatic'"
        icon="cog"
        size="xs"
      />
      <font-awesome-icon
        v-else-if="tag.class === 'human'"
        icon="user"
        size="xs"
      />
      <font-awesome-icon
        v-else-if="tag.class === 'automatic human'"
        icon="user-cog"
        size="xs"
      />
    </span>
    <span class="tag-label">{{ tag.text }}</span>
  </span>
</template>

<script>
export default {
  name: "TagBadge",
  props: {
    tag: {
      type: Object,
      required: true
    }
  },
  methods: {
    getTagTitle(str) {
      switch (str) {
        case "automatic":
          return "Tagged by Cacophony AI";
        case "human":
          return "Tagged by human";
        case "automatic human":
          return "Tagged by Cacophony AI and human";
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
.tag {
  &.badge {
    font-weight: initial;
    font-size: 90%;
    color: $white;
    background: $secondary;
    margin-right: 0.3rem;
    line-height: 0.7;
  }
  &.automatic {
    background: $danger;
  }
  &.human {
    background: $success;
  }
  &.automatic.human {
    background: $info;
  }
  .svg-inline--fa {
    color: $white;
  }
}
</style>
