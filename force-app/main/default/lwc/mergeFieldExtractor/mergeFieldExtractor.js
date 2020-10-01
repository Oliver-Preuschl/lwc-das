/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-21-2020   Oliver Preuschl                      Initial Version
 **/
export default class MergeFieldExtractor {
  static extractMergeFields(propertyValue) {
    if (!propertyValue) {
      return [];
    }
    return MergeFieldExtractor.getMergeFieldMatches(
      propertyValue
    ).map((mergeFieldWithBrackets) =>
      this.removeBrackets(mergeFieldWithBrackets)
    );
  }

  static getMergeFieldMatches(propertyValue) {
    return propertyValue.match(/{(.*?)}/g);
  }

  static removeBrackets(mergeFieldWithBrackets) {
    return mergeFieldWithBrackets.replace("{", "").replace("}", "");
  }
}
