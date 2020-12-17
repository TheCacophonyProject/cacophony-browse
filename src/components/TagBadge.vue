<template>
  <span
    v-b-tooltip="getTagTitle(tag.class)"
    :class="['tag', 'badge', tag.class]"
  >
    <span class="tag-icon">
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
    <span class="tag-label">{{ mapLabel(tag) }}</span>
  </span>
</template>

<script>
export default {
  name: "TagBadge",
  props: {
    tag: {
      type: Object,
      required: true,
    },
  },
  methods: {
    mapLabel(tag) {
      if (tag.text === "unknown" && tag.class.includes("human")) {
        return "not identifiable";
      }
      return tag.text.replace(/-/g, " ");
    },
    getTagTitle(str) {
      switch (str) {
        case "automatic":
          return "Tagged by Cacophony AI";
        case "human":
          return "Tagged by human";
        case "automatic human":
          return "Tagged by Cacophony AI and human";
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "../styles/tag-colours";

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
    background: $ai;
  }
  &.human {
    background: $human;
  }
  &.automatic.human {
    background: $aihuman;
  }
  .svg-inline--fa {
    color: $white;
  }
}
</style>
