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
