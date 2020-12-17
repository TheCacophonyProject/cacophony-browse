function classifyTrack(tags, isWallabyProject) {
  const aiTags = tags.filter((tag) => tag.data && tag.data.name);
  if (isWallabyProject) {
    return classifyTrackWallabyProject(aiTags);
  } else {
    return classifyTrackBirdProject(aiTags);
  }
}

function classifyTrackWallabyProject(aiTags) {
  const values = aiTags.filter((tag) =>
    tag.data.name.toLowerCase().includes("wallaby")
  );

  // Multiple tags so choose one.
  const movement2 = values.find(
    (tag) => tag.data.name === "Wallaby-Movement v2"
  );
  if (movement2) {
    return movement2;
  }

  const movement1 = values.find((tag) => tag.data.name === "Wallaby-Movement");
  if (movement1) {
    return movement1;
  }

  return values[0];
}

function classifyTrackBirdProject(aiTags) {
  // remove wallaby ai tags
  const tagsToUse = aiTags.filter(
    (tag) => !tag.data.name.toLowerCase().includes("wallaby")
  );

  if (tagsToUse.length == 0) {
    return undefined;
  }

  // remove undefined tags
  const classifications = tagsToUse.filter(
    (tag) => tag.what !== "unidentified"
  );
  if (classifications.length == 0) {
    return tagsToUse[0];
  } else if (classifications.length == 1) {
    return classifications[0];
  }

  // more than one ai has classified this result.   Choose one.
  const originalTag = classifications.find(
    (tag) => tag.data.name === "Original"
  );
  if (originalTag && originalTag.what === "bird") {
    return originalTag;
  }

  const resNetTag = classifications.find((tag) => tag.data.name === "Resnet");
  if (resNetTag) {
    return resNetTag;
  }

  if (classifications[0].data.name !== "Original") {
    return classifications[0];
  }
  return classifications[1];
}

export { classifyTrack };
