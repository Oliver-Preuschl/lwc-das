/*
 * Copyright 2021 Oliver Preuschl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createElement } from "lwc";
import DistributedStateTransformation from "c/distributedStateTransformation";
import { registerTestWireAdapter } from "@salesforce/sfdx-lwc-jest";
import {
  publish,
  MessageContext,
  resetSubscriptions
} from "lightning/messageService";

import STATE_UPDATE_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateUpdate__c";

//Apex
import getPropertyTransformationsByName from "@salesforce/apex/DistributedStateTransformation.getPropertyTransformationsByName";

const MESSAGE_CONTEXT_WIRE_ADAPTER = registerTestWireAdapter(MessageContext); // eslint-disable-line

jest.mock(
  "@salesforce/apex/DistributedStateTransformation.getPropertyTransformationsByName",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

const PROPERTY_TRANSFORMNATIONS_SUCCESS_DYNAMIC = [
  {
    SourcePropertyName__c: "selectedSObjectApiName",
    TargetPropertyName__c: "sObjectFieldNames",
    SourceValue__c: "Account",
    TargetValue__c: "Name,Industry,{selectedSObjectApiName}",
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

const PROPERTY_TRANSFORMNATIONS_ERROR = {
  status: 500,
  body: { message: "Divide by 0" },
  headers: {}
};

describe("state transformation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSubscriptions();
  });

  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should publish sObjectFieldNames state property update for existing proprty transformation", () => {
    getPropertyTransformationsByName.mockResolvedValue(
      PROPERTY_TRANSFORMNATIONS_SUCCESS_DYNAMIC
    );
    const element = createElement("c-distributed-state-transformation", {
      is: DistributedStateTransformation
    });
    document.body.appendChild(element);
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_UPDATE_MESSAGE, {
        property: {
          name: "selectedSObjectApiName",
          value: "Account"
        },
        publisher: { name: "element-2", id: 2 }
      });
      expect(publish).toBeCalledWith(undefined, STATE_UPDATE_MESSAGE, {
        property: { name: "sObjectFieldNames", value: "Name,Industry,Account" },
        publisher: { id: 1, name: "DeclarativeStateTransformation" }
      });
    });
  });

  it("should not publish sObjectFieldNames state property update for not existing proprty transformation (error)", () => {
    getPropertyTransformationsByName.mockRejectedValue(
      PROPERTY_TRANSFORMNATIONS_ERROR
    );
    const element = createElement("c-distributed-state-transformation", {
      is: DistributedStateTransformation
    });
    document.body.appendChild(element);
    return Promise.resolve().then(() => {
      publish(MESSAGE_CONTEXT_WIRE_ADAPTER, STATE_UPDATE_MESSAGE, {
        property: {
          name: "selectedSObjectApiName",
          value: "Account"
        },
        publisher: { name: "element-2", id: 2 }
      });
      expect(publish).not.toBeCalledWith(undefined, STATE_UPDATE_MESSAGE, {
        property: { name: "sObjectFieldNames", value: "Name,Industry" },
        publisher: { id: 1, name: "DeclarativeStateTransformation" }
      });
    });
  });
});
