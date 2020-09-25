/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-21-2020   Oliver Preuschl                      Initial Version
 **/

import Logger from "c/logger";

export default class DynamicPropertyUpdater {
  targetComponent;
  state;
  dynamicProperty;
  updatedDynamicPropertyValue;
  wasMergeFieldFound;
  isMergeFieldValueMissing;

  constructor(targetComponent, dynamicProperty) {
    this.targetComponent = targetComponent;
    this.state = targetComponent.externalState;
    this.dynamicProperty = dynamicProperty;
  }

  initDynamicPropertyValue() {
    const matches = this.getMergeFieldMatches();
    if (!!matches) {
      this.clearDynamicPropertyValue();
    }
  }

  clearDynamicPropertyValue() {
    if (this.dynamicProperty.emptyIfNotResolvable) {
      this.updateDynamicPropertyValue(
        "",
        'deletion ("") due to missing merge field value'
      );
    } else {
      this.updateDynamicPropertyValue(
        null,
        "deletion (null) due to missing merge field value"
      );
    }
  }

  updateDynamicPropertyValueFromState() {
    if (!this.dynamicProperty.originalValue) {
      return;
    }
    const matches = this.getMergeFieldMatches(this.dynamicProperty);
    if (!matches) {
      return;
    }
    this.updateDynamicPropertyValuesForMatchGroup(matches);
    if (!this.wasMergeFieldFound || this.isMergeFieldValueMissing) {
      this.clearDynamicPropertyValue();
    } else {
      this.updateDynamicPropertyValue(
        this.updatedDynamicPropertyValue,
        "current state value(s)"
      );
    }
  }

  getMergeFieldMatches() {
    return this.dynamicProperty.originalValue.matchAll(
      /(?<mergeFieldWithBrackets>{.*?})/gi
    );
  }

  updateDynamicPropertyValuesForMatchGroup(matches) {
    this.updatedDynamicPropertyValue = this.dynamicProperty.originalValue;
    this.wasMergeFieldFound = false;
    this.isMergeFieldValueMissing = false;
    for (let match of matches) {
      if (!match.groups) {
        continue;
      }
      this.wasMergeFieldFound = true;
      if (DynamicPropertyUpdater.isIterable(match.groups)) {
        for (let group of match.groups) {
          this.updateDynamicPropertyValueWithMergeFieldValue(
            group.mergeFieldWithBrackets
          );
        }
      } else {
        this.updateDynamicPropertyValueWithMergeFieldValue(
          match.groups.mergeFieldWithBrackets
        );
      }
    }
  }

  static isIterable(obj) {
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === "function";
  }

  updateDynamicPropertyValueWithMergeFieldValue(mergeFieldWithBrackets) {
    const mergeField = mergeFieldWithBrackets.replace("{", "").replace("}", "");
    if (!this.isMergeFieldAvailableInState(mergeField)) {
      if (!this.dynamicProperty.emptyIfNotResolvable) {
        this.updatedDynamicPropertyValue = this.updatedDynamicPropertyValue.replace(
          mergeFieldWithBrackets,
          ""
        );
      }
      this.isMergeFieldValueMissing = true;
      return;
    }
    this.updatedDynamicPropertyValue = this.updatedDynamicPropertyValue.replace(
      mergeFieldWithBrackets,
      this.state[mergeField]
    );
  }

  isMergeFieldAvailableInState(mergeField) {
    return (
      this.state[mergeField] !== undefined && this.state[mergeField] !== null
    );
  }

  updateDynamicPropertyValue(newValue, logInfo) {
    if (this.targetComponent[this.dynamicProperty.name] === newValue) {
      Logger.logMessage(
        "property-updated",
        `${this.dynamicProperty.name}: "${newValue}" (${logInfo}) - (no difference - update skipped)`
      );
      return;
    }
    Logger.logMessage(
      "property-updated",
      `${this.dynamicProperty.name}: "${newValue}" (${logInfo})`
    );
    this.targetComponent[this.dynamicProperty.name] = newValue;
  }
}
