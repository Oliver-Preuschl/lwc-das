import { createElement } from "lwc";
import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";
import { registerTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import { publish, MessageContext } from "lightning/messageService";

import STATE_UPDATE_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateUpdate__c";
import STATE_INIT_REQUEST_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateInitRequest__c";

registerTestWireAdapter(MessageContext);

describe("state init", () => {
  let context;
  let testElement;
  class TestComponent extends LightningElementWithDistributedApplicationState {
    dynamicProperty1 = "static {mergeField-1}";

    constructor() {
      super();
      context = this;
    }
  }
  beforeEach(() => {
    testElement = createElement("TestComponent-1", {
      is: TestComponent
    });
  });

  afterEach(() => {
    context = undefined;
    testElement = undefined;
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should not handle state init request mesage", () => {
    document.body.appendChild(testElement);
    context.internalState["mergeField1"] = "initialValue-1";
    context.handleStateInitRequest({
      requester: { name: context.constructor.name, id: context.id }
    });
    return Promise.resolve().then(() => {
      expect(publish).not.toBeCalled();
    });
  });

  it("should init dynamic properties with null", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    return Promise.resolve().then(() => {
      expect(context.dynamicProperty1).toBe(null);
    });
  });

  it("should init dynamic properties with empty value", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [
        { name: "dynamicProperty1", emptyIfNotResolvable: true }
      ]
    });
    return Promise.resolve().then(() => {
      expect(context.dynamicProperty1).toBe("");
    });
  });

  it("should publish state init request mesage", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    return Promise.resolve().then(() => {
      expect(publish).toHaveBeenCalledWith(
        undefined,
        STATE_INIT_REQUEST_MESSAGE,
        {
          requester: { name: context.constructor.name, id: context.id }
        }
      );
    });
  });

  it("should handle state init request mesage", () => {
    document.body.appendChild(testElement);
    context.internalState["mergeField1"] = "initialValue-1";
    context.handleStateInitRequest({
      requester: { name: context.constructor.name, id: context.id + 1 }
    });
    return Promise.resolve().then(() => {
      expect(publish).toHaveBeenCalledWith(undefined, STATE_UPDATE_MESSAGE, {
        property: {
          name: "mergeField1",
          value: "initialValue-1"
        },
        publisher: { name: context.constructor.name, id: context.id }
      });
    });
  });
});

describe("state update publishing", () => {
  let context;
  let testElement;
  class TestComponent extends LightningElementWithDistributedApplicationState {
    dynamicProperty1 = "static {mergeField-1}";

    constructor() {
      super();
      context = this;
    }
  }
  beforeEach(() => {
    testElement = createElement("TestComponent-1", {
      is: TestComponent
    });
  });

  afterEach(() => {
    context = undefined;
    testElement = undefined;
  });

  it("should publish state update mesage", () => {
    document.body.appendChild(testElement);
    context.publishStateChange("mergeField-1", "updated-1");
    return Promise.resolve().then(() => {
      expect(publish).toHaveBeenCalledWith(undefined, STATE_UPDATE_MESSAGE, {
        property: {
          name: "mergeField-1",
          value: "updated-1"
        },
        publisher: { name: context.constructor.name, id: context.id }
      });
    });
  });
});

describe("state update handling", () => {
  let context;
  let testElement;
  class TestComponent extends LightningElementWithDistributedApplicationState {
    dynamicProperty1 = "static {mergeField-1}";

    constructor() {
      super();
      context = this;
    }
  }
  beforeEach(() => {
    testElement = createElement("TestComponent-1", {
      is: TestComponent
    });
  });

  afterEach(() => {
    context = undefined;
    testElement = undefined;
  });

  it("should handle state update mesage", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    context.handleStateChange({
      property: {
        name: "mergeField-1",
        value: "updated-1"
      },
      publisher: { name: context.constructor.name, id: context.id + 1 }
    });
    return Promise.resolve().then(() => {
      expect(context.dynamicProperty1).toBe("static updated-1");
    });
  });

  it("should handle state update mesage (All)", () => {
    document.body.appendChild(testElement);
    const mockCallback = jest.fn(() => {});
    context.initState({
      stateUpdateCallback: mockCallback
    });
    context.handleStateChange({
      property: {
        name: "mergeField-1",
        value: "updated-1"
      },
      publisher: { name: context.constructor.name, id: context.id + 1 }
    });
    return Promise.resolve().then(() => {
      expect(mockCallback).toBeCalled();
    });
  });

  it("should not handle state update mesage", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    context.handleStateChange({
      property: {
        name: "mergeField-1",
        value: "updated-1"
      },
      publisher: { name: context.constructor.name, id: context.id }
    });
    return Promise.resolve().then(() => {
      expect(context.dynamicProperty1).toBe(null);
    });
  });

  it("should empty dynamicProperty", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [
        { name: "dynamicProperty1", emptyIfNotResolvable: true }
      ]
    });
    context.handleStateChange({
      property: {
        name: "mergeField-2",
        value: "updated-2"
      },
      publisher: { name: context.constructor.name, id: context.id + 1 }
    });
    return Promise.resolve().then(() => {
      expect(context.dynamicProperty1).toBe("");
    });
  });

  it("should null dynamicProperty", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    context.handleStateChange({
      property: {
        name: "mergeField-2",
        value: "updated-2"
      },
      publisher: { name: context.constructor.name, id: context.id + 1 }
    });
    return Promise.resolve().then(() => {
      expect(context.dynamicProperty1).toBe(null);
    });
  });
});
