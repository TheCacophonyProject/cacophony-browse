jest.mock("./fetch");
import { fetch } from "./fetch";
import recordingApi from "./Recording.api";
import querystring from "querystring";

describe("query() translates to api correctly", () => {
  test("with no params", () => {
    expect(recordingApi.makeApiQuery({})).toMatchObject({});
  });

  test("with limit or offset", () => {
    const query = {
      limit: 3,
      offset: 1,
    };
    expect(recordingApi.makeApiQuery(query)).toMatchObject(query);
  });

  test("with days all", () => {
    const query = {
      days: "all",
    };
    expect(recordingApi.makeApiQuery(query)).toMatchObject({});
  });

  test("with date to", () => {
    const query = {
      to: "2030-12-06",
    };
    expect(recordingApi.makeApiQuery(query).where).toContain(
      '"recordingDateTime":{"$lt":"2030-12-06"'
    );
  });

  test("with date to and date from", () => {
    const query = {
      from: "2010-01-01",
      to: "2030-12-06",
    };
    expect(recordingApi.makeApiQuery(query).where).toContain(
      '"recordingDateTime":{"$gt":"2010-01-01","$lt":"2030-12-06"'
    );
  });

  test("with animal tag (string)", () => {
    const query = {
      tagMode: "tagged",
      tag: "cat",
    };
    expect(recordingApi.makeApiQuery(query)).toMatchObject({
      tagMode: "tagged",
      tags: '["cat"]',
    });
  });

  test("with animal tag as array", () => {
    const query = {
      tagMode: "tagged",
      tag: ["cat", "possum"],
    };
    expect(recordingApi.makeApiQuery(query)).toMatchObject({
      tagMode: "tagged",
      tags: '["cat","possum"]',
    });
  });

  test("with duration start time", () => {
    const query = {
      minS: "12",
    };
    expect(recordingApi.makeApiQuery(query).where).toContain(
      '"duration":{"$gte":"12"'
    );
  });

  test("with no duration defaults to 0", () => {
    expect(recordingApi.makeApiQuery({}).where).toContain(
      '"duration":{"$gte":"0"'
    );
  });

  test("with max duration", () => {
    const query = {
      minS: "3",
      maxS: "55",
    };
    expect(recordingApi.makeApiQuery(query).where).toContain(
      '"duration":{"$gte":"3","$lte":"55"'
    );
  });
});

describe("query() calls fetch", () => {
  test("with the correct request params", async () => {
    await recordingApi.query({});
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1].method).toBe("GET");
  });

  test("with the correct path", async () => {
    await recordingApi.query({});
    expect(fetch.mock.calls[0][0]).toContain(
      "http://mocked-api-path/api/v1/recordings?"
    );
  });

  test("just once", async () => {
    await recordingApi.query({});
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("id() calls fetch", () => {
  test("with the correct request params", async () => {
    await recordingApi.id();
    expect(fetch.mock.calls[0]).toHaveLength(2);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "GET",
    });
  });

  test("with the correct path", async () => {
    const testId = 12345;
    await recordingApi.id(testId);
    expect(fetch.mock.calls[0][0]).toBe(
      `http://mocked-api-path/api/v1/recordings/${testId}`
    );
  });

  test("just once", async () => {
    await recordingApi.id();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("comment() calls fetch", () => {
  test("with the correct path", async () => {
    const testId = 123456;
    await recordingApi.comment(null, testId);
    expect(fetch.mock.calls[0][0]).toBe(
      `http://mocked-api-path/api/v1/recordings/${testId}`
    );
  });

  test("with the correct request params", async () => {
    const testComment = "some comment";

    await recordingApi.comment(testComment, null);
    expect(fetch.mock.calls[0]).toHaveLength(3);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "PATCH",
      body: JSON.stringify({
        updates: {
          comment: testComment,
        },
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  });

  test("just once", async () => {
    await recordingApi.comment();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("del() calls fetch", () => {
  test("with the correct path", async () => {
    const testId = 123456;
    await recordingApi.del(testId);
    expect(fetch.mock.calls[0][0]).toBe(
      `http://mocked-api-path/api/v1/recordings/${testId}`
    );
  });

  test("with the correct request params", async () => {
    await recordingApi.del(null);
    expect(fetch.mock.calls[0]).toHaveLength(3);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "DELETE",
    });
  });

  test("just once", async () => {
    await recordingApi.del();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
