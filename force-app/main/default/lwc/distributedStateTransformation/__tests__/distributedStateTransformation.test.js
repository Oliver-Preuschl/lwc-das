import { createElement } from "lwc";
import DistributedStateTransformation from "c/distributedStateTransformation";
import { registerTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import { publish, subscribe, MessageContext } from "lightning/messageService";

import STATE_UPDATE_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateUpdate__c";
import STATE_INIT_REQUEST_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateInitRequest__c";

//Apex
import getPropertyTransformationsByName from "@salesforce/apex/DistributedStateTransformation.getPropertyTransformationsByName";

const messageContextWireAdapter = registerTestWireAdapter(MessageContext);

jest.mock(
  "@salesforce/apex/DistributedStateTransformation.getPropertyTransformationsByName",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

const PROPERTY_TRANSFORMNATIONS_SUCCESS = [
  {
    SourcePropertyName__c: "selectedSObjectApiName",
    TargetPropertyName__c: "sObjectFieldNames",
    SourceValue__c: "Account",
    TargetValue__c: "Name,Industry",
    IsDynamic__c: true
  },
  {
    SourcePropertyName__c: "selectedSObjectApiName",
    TargetPropertyName__c: "sObjectFieldNames",
    SourceValue__c: "Contact",
    TargetValue__c: "FirstName,LastName",
    IsDynamic__c: true
  }
];

describe("state transformation", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("should update sObjectFieldNames property", () => {
    getPropertyTransformationsByName.mockResolvedValue(
      PROPERTY_TRANSFORMNATIONS_SUCCESS
    );
    const element = createElement("c-distributed-state-transformation", {
      is: DistributedStateTransformation
    });
    document.body.appendChild(element);
    publish(messageContextWireAdapter, STATE_UPDATE_MESSAGE, {
      property: {
        name: "selectedSObjectApiName",
        value: "Account"
      },
      publisher: { name: "element-2", id: 2 }
    });
    return Promise.resolve().then(() => {
      expect(publish).toBeCalledWith(STATE_UPDATE_MESSAGE);
    });
  });
});
