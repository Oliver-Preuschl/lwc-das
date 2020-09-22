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
    const matches = MergeFieldExtractor.getMergeFieldMatches(propertyValue);
    if (!matches) {
      return [];
    }
    let foundMergeFields = [];
    for (let match of matches) {
      if (!match.groups) {
        continue;
      }
      if (MergeFieldExtractor.isIterable(match.groups)) {
        for (let group of match.groups) {
          const foundMergeField = MergeFieldExtractor.getMergeFieldFromMatchGroup(
            group
          );
          foundMergeFields.push(foundMergeField);
        }
      } else {
        const foundMergeField = MergeFieldExtractor.getMergeFieldFromMatchGroup(
          match.groups
        );
        foundMergeFields.push(foundMergeField);
      }
    }
    return foundMergeFields;
  }

  static getMergeFieldMatches(propertyValue) {
    return propertyValue.matchAll(/(?<mergeFieldWithBrackets>{.*?})/gi);
  }

  static getMergeFieldFromMatchGroup(group) {
    return group.mergeFieldWithBrackets.replace("{", "").replace("}", "");
  }

  static isIterable(obj) {
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === "function";
  }
}
