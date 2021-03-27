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

import DynamicPropertyUpdater from "c/dynamicPropertyUpdater";

describe("Dynamic Property Init", () => {
  it("should init dynamic property with  by default", () => {
    const context = {};
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})"
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    expect(context.contactCriteria).toBe(null);
  });

  it("should init dynamic property with null", () => {
    const context = {};
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      nullIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    expect(context.contactCriteria).toBe(null);
  });

  it("should init dynamic property with empty string", () => {
    const context = {};
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      emptyIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    expect(context.contactCriteria).toBe("");
  });
});

describe("Dynamic Property Merge", () => {
  it("should return undefined for missing dynamic property value", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria"
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    const mergedDynamicProperty = dynamicPropertyUpdater.getMergedDynamicPropertyValue();
    expect(mergedDynamicProperty).toBe(undefined);
  });

  it("should return undefined for missing merge field", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ()"
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    const mergedDynamicProperty = dynamicPropertyUpdater.getMergedDynamicPropertyValue();
    expect(mergedDynamicProperty).toBe(undefined);
  });

  it("should return null for missing state property by default", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})"
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    const mergedDynamicProperty = dynamicPropertyUpdater.getMergedDynamicPropertyValue();
    expect(mergedDynamicProperty).toBe(null);
  });

  it("should return null for missing state property", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      nullIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    const mergedDynamicProperty = dynamicPropertyUpdater.getMergedDynamicPropertyValue();
    expect(mergedDynamicProperty).toBe(null);
  });

  it("should return empty for missing state property", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      emptyIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    const mergedDynamicProperty = dynamicPropertyUpdater.getMergedDynamicPropertyValue();
    expect(mergedDynamicProperty).toBe("");
  });

  it("should return merged dynamic property", () => {
    const context = { externalState: { selectedAccountIds: "'id1','id2'" } };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      emptyIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    const mergedDynamicProperty = dynamicPropertyUpdater.getMergedDynamicPropertyValue();
    expect(mergedDynamicProperty).toBe("AccountId in ('id1','id2')");
  });
});

describe("Dynamic Property Update", () => {
  it("should do nothing for missing dynamic property value", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria"
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    dynamicPropertyUpdater.updateDynamicPropertyValueFromState();
    expect(context.contactCriteria).toBe(undefined);
  });

  it("should do nothing for missing merge field", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ()"
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    dynamicPropertyUpdater.updateDynamicPropertyValueFromState();
    expect(context.contactCriteria).toBe(undefined);
  });

  it("should null dynamic property for missing state property by default", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})"
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    dynamicPropertyUpdater.updateDynamicPropertyValueFromState();
    expect(context.contactCriteria).toBe(null);
  });

  it("should null dynamic property for missing state property", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      nullIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    dynamicPropertyUpdater.updateDynamicPropertyValueFromState();
    expect(context.contactCriteria).toBe(null);
  });

  it("should empty dynamic property for missing state property", () => {
    const context = { externalState: {} };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      emptyIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    dynamicPropertyUpdater.updateDynamicPropertyValueFromState();
    expect(context.contactCriteria).toBe("");
  });

  it("should update dynamic property", () => {
    const context = { externalState: { selectedAccountIds: "'id1','id2'" } };
    const dynamicProperty = {
      name: "contactCriteria",
      originalValue: "AccountId in ({selectedAccountIds})",
      emptyIfNotResolvable: true
    };
    const dynamicPropertyUpdater = new DynamicPropertyUpdater(
      context,
      dynamicProperty
    );
    dynamicPropertyUpdater.initDynamicPropertyValue();
    dynamicPropertyUpdater.updateDynamicPropertyValueFromState();
    expect(context.contactCriteria).toBe("AccountId in ('id1','id2')");
  });
});
