jest.mock("./fetch");
import { fetch } from "./fetch";
import tagApi from "./Tag.api";

describe("addTag() calls fetch", () => {
  test("with the correct path", async () => {
    await tagApi.addTag();
    expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/tags`);
  });

  test("with the correct request params", async () => {
    const testRecordingId = 123456,
      testTag = { someKey: "some value" };

    await tagApi.addTag(testTag, testRecordingId);
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        recordingId: testRecordingId,
        tag: testTag
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  });

  test("just once", async () => {
    await tagApi.addTag();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("deleteTag() calls fetch", () => {
  test("with the correct path", async () => {
    await tagApi.deleteTag();
    expect(fetch.mock.calls[0][0]).toBe(`http://mocked-api-path/api/v1/tags`);
  });

  test("with the correct request params", async () => {
    const testTagId = 123456;

    await tagApi.deleteTag(testTagId);
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "DELETE",
      body: JSON.stringify({ tagId: testTagId }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  });

  test("just once", async () => {
    await tagApi.deleteTag();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
