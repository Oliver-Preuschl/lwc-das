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

import MergeFieldExtractor from "c/mergeFieldExtractor";

describe("Merge Field Extration", () => {
  afterEach(() => {
    /*while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }*/
  });

  it("should extract single merge field", () => {
    const propertyValue = "AccountId in ({selectedAccountIds})";
    const foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    expect(foundMergeFields.length).toBe(1);
  });

  it("should return empty array", () => {
    const propertyValue = "";
    const foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    expect(foundMergeFields.length).toBe(0);
  });

  it("should extract single merge field name", () => {
    const propertyValue = "AccountId in ({selectedAccountIds})";
    const foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    expect(foundMergeFields[0]).toBe("selectedAccountIds");
  });

  it("should extract two merge fields", () => {
    const propertyValue =
      "AccountId in ({selectedAccountIds}) AND BillingCountry = '{BillingCountry}'";
    const foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    expect(foundMergeFields.length).toBe(2);
  });

  it("should extract first of two merge field names", () => {
    const propertyValue =
      "AccountId in ({selectedAccountIds}) AND BillingCountry = '{BillingCountry}'";
    const foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    expect(foundMergeFields[0]).toBe("selectedAccountIds");
  });

  it("should extract sencond of two merge field names", () => {
    const propertyValue =
      "AccountId in ({selectedAccountIds}) AND BillingCountry = '{BillingCountry}'";
    const foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    expect(foundMergeFields[1]).toBe("BillingCountry");
  });
});
