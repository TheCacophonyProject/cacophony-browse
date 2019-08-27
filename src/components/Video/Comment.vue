<template>
  <div>
    <b-modal
      id="update-comment"
      title="Update Comment"
      @ok="updateComment"
      @show="reset"
      @shown="setFocus">
      <b-form-group label="Comment">
        <b-input
          ref="comment-input"
          v-model="comment"/>
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "Comment",
  props: {
    initialComment: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      comment: this.initialComment
    };
  },
  methods: {
    async updateComment() {
      this.$emit("updateComment", this.comment);
    },
    reset() {
      this.comment = this.initialComment;
    },
    setFocus() {
      this.$refs["comment-input"].focus();
    }
  }
};
</script>

<style scoped></style>
