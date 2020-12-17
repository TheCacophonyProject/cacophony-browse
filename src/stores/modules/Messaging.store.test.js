import store from "../../stores";
import MessagingStore from "../../stores/modules/Messaging.store";

describe("Actions", () => {
  store.commit = jest.fn();

  test("WARN/ERROR/INFO/SUCCESS commit log mutations", async () => {
    const testMessage = "some message";

    const actionCalls = [
      { name: "WARN", level: "warning" },
      { name: "ERROR", level: "danger" },
      { name: "INFO", level: "info" },
      { name: "SUCCESS", level: "success" },
    ];

    actionCalls.forEach(
      async (action) =>
        await store.dispatch(`Messaging/${action.name}`, testMessage)
    );

    expect(store.commit).toHaveBeenCalledTimes(4);

    actionCalls.forEach((action, index) => {
      expect(store.commit).toHaveBeenNthCalledWith(
        index + 1,
        "Messaging/log",
        { message: testMessage, level: action.level },
        undefined
      );
    });
  });

  test("ACKNOWLEDGE commits acknowledge mutation", async () => {
    await store.dispatch("Messaging/ACKNOWLEDGE");
    expect(store.commit).toHaveBeenCalledTimes(1);
    expect(store.commit).toHaveBeenCalledWith(
      "Messaging/acknowledge",
      undefined,
      undefined
    );
  });
});

describe("Mutations", () => {
  let initialState;
  const testMessageObject = { some: "message object" };

  beforeEach(() => {
    initialState = Object.assign({}, MessagingStore.state);
  });

  test("log() sets message state", async () => {
    expect(initialState.messages).toMatchObject([]);
    MessagingStore.mutations.log(initialState, testMessageObject);
    expect(initialState.messages).toMatchObject([testMessageObject]);
  });

  test("acknowledge() resets message state", async () => {
    initialState.messages = [testMessageObject];
    expect(initialState.messages).toMatchObject(initialState.messages);

    MessagingStore.mutations.acknowledge(initialState);
    expect(initialState.messages).toMatchObject([]);
  });
});
