import CacophonyApi from "./CacophonyApi";

export default {
  addTag,
  deleteTag,
};

const apiPath = "/api/v1/tags";

function addTag(tag, id) {
  return CacophonyApi.post(apiPath, {
    recordingId: id,
    tag: tag,
  });
}

function deleteTag(id) {
  return CacophonyApi.delete(apiPath, { tagId: id });
}
