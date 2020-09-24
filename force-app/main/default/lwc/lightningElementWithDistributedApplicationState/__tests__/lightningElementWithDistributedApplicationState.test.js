import { createElement } from "lwc";
import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";
import { registerTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import { publish, MessageContext } from "lightning/messageService";

import STATE_UPDATE_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateUpdate__c";
import STATE_INIT_REQUEST_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateInitRequest__c";

registerTestWireAdapter(MessageContext);

describe("c-lightning-element-with-distributed-application-state", () => {
  let context;
  let testElement1;
  class TestComponent1 extends LightningElementWithDistributedApplicationState {
    dynamicProperty1 = "static {mergeField-1}";

    constructor() {
      super();
      context = this;
    }

    connectedCallback() {
      this.initState({
        dynamicProperties: [{ name: "dynamicProperty1" }]
      });
    }
  }
  beforeEach(() => {
    testElement1 = createElement("TestComponent-1", {
      is: TestComponent1
    });
  });
  afterEach(() => {
    context = undefined;
    testElement1 = undefined;
    /*while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }*/
  });

  it("should publish state update mesage", () => {
    document.body.appendChild(testElement1);
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

  it("should handle state update mesage", () => {
    document.body.appendChild(testElement1);
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
});
