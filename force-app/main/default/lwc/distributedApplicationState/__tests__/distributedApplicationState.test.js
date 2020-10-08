import { LightningElement, api, createElement } from "lwc";
import { DistributedApplicationStateMixin } from "c/distributedApplicationState";
import { registerTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import { publish, MessageContext } from "lightning/messageService";

import STATE_UPDATE_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateUpdate__c";
import STATE_INIT_REQUEST_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateInitRequest__c";

const MESSAGE_CONTEXT_WIRE_ADAPTER = registerTestWireAdapter(MessageContext); // eslint-disable-line

describe("state init", () => {
  let context;
  let testElement;
  class TestComponent extends DistributedApplicationStateMixin(
    LightningElement
  ) {
    dynamicProperty1 = "static {mergeField1}";

    constructor() {
      super();
      context = this;
    }

    disconnectedCallback() {
      this.terminateState();
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
    jest.clearAllMocks();
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

  it("should not handle own state init request mesage", () => {
    document.body.appendChild(testElement);
    context.internalState.mergeField1 = "initialValue-1";
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_INIT_REQUEST_MESSAGE, {
        requester: { name: context.constructor.name, id: context.id }
      });
      expect(publish).toBeCalledTimes(2);
    });
  });

  it("should handle state init request mesage", () => {
    document.body.appendChild(testElement);
    context.internalState.mergeField1 = "initialValue-1";
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_INIT_REQUEST_MESSAGE, {
        requester: { name: context.constructor.name, id: context.id + 1 }
      });
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
  class TestComponent extends DistributedApplicationStateMixin(
    LightningElement
  ) {
    dynamicProperty1 = "static {mergeField-1}";

    constructor() {
      super();
      context = this;
    }

    disconnectedCallback() {
      this.terminateState();
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
    jest.clearAllMocks();
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
  class TestComponent extends DistributedApplicationStateMixin(
    LightningElement
  ) {
    dynamicProperty1 = "static {mergeField-1}";

    constructor() {
      super();
      context = this;
    }

    disconnectedCallback() {
      this.terminateState();
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
    jest.clearAllMocks();
  });

  it("should handle state update mesage", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_UPDATE_MESSAGE, {
        property: {
          name: "mergeField-1",
          value: "updated-1"
        },
        publisher: { name: context.constructor.name, id: context.id + 1 }
      });
      expect(context.dynamicProperty1).toBe("static updated-1");
    });
  });

  it("should handle state update mesage (All)", () => {
    document.body.appendChild(testElement);
    const mockCallback = jest.fn(() => {});
    context.initState({
      stateUpdateCallback: mockCallback
    });
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_UPDATE_MESSAGE, {
        property: {
          name: "mergeField-1",
          value: "updated-1"
        },
        publisher: { name: context.constructor.name, id: context.id + 1 }
      });
      expect(mockCallback).toBeCalled();
    });
  });

  it("should not handle state update mesage", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_UPDATE_MESSAGE, {
        property: {
          name: "mergeField-1",
          value: "updated-1"
        },
        publisher: { name: context.constructor.name, id: context.id }
      });
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
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_UPDATE_MESSAGE, {
        property: {
          name: "mergeField-2",
          value: "updated-2"
        },
        publisher: { name: context.constructor.name, id: context.id + 1 }
      });
      expect(context.dynamicProperty1).toBe("");
    });
  });

  it("should null dynamicProperty", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [{ name: "dynamicProperty1" }]
    });
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_UPDATE_MESSAGE, {
        property: {
          name: "mergeField-2",
          value: "updated-2"
        },
        publisher: { name: context.constructor.name, id: context.id + 1 }
      });
      expect(context.dynamicProperty1).toBe(null);
    });
  });
});

describe("object and record context", () => {
  let context;
  let testElement;
  class TestComponent extends DistributedApplicationStateMixin(
    LightningElement
  ) {
    @api objectApiName;
    @api recordId;

    objectApiNameProperty = "static {objectApiName}";
    recordIdProperty = "static {recordId}";

    constructor() {
      super();
      context = this;
    }

    disconnectedCallback() {
      this.terminateState();
    }
  }
  beforeEach(() => {
    testElement = createElement("TestComponent-1", {
      is: TestComponent
    });
    testElement.objectApiName = "012345678901234567";
    testElement.recordId = "123456789012345678";
  });

  afterEach(() => {
    context = undefined;
    testElement = undefined;
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("should register objectApiName and recordId propertyies", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [
        { name: "objectApiNameProperty" },
        { name: "recordId" }
      ]
    });
    return Promise.resolve().then(() => {
      expect(context.externalState.objectApiName).toBe("012345678901234567");
      expect(context.externalState.recordId).toBe("123456789012345678");
    });
  });

  it("should update objectApiName in dynamic property", () => {
    document.body.appendChild(testElement);
    context.initState({
      dynamicProperties: [
        { name: "objectApiNameProperty" },
        { name: "recordId" }
      ]
    });
    return Promise.resolve().then(() => {
      expect(context.objectApiNameProperty).toBe("static 012345678901234567");
    });
  });
});