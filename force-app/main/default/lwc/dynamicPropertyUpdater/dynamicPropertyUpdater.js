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
      this.targetComponent[this.dynamicProperty.name] = "";
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
    if (
      this.wasMergeFieldFound &&
      (!this.isMergeFieldValueMissing ||
        !this.dynamicProperty.emptyIfNotResolvable)
    ) {
      this.updateDynamicPropertyValue(
        this.dynamicProperty.name,
        this.updatedDynamicPropertyValue,
        "current state value(s)"
      );
    } else if (
      !this.wasMergeFieldFound &&
      this.targetComponent[this.dynamicProperty.name] !==
        this.dynamicProperty.originalValue
    ) {
      this.updateDynamicPropertyValue(
        this.dynamicProperty.name,
        this.dynamicProperty.originalValue,
        "reset to orignial value"
      );
    } else if (
      this.isMergeFieldValueMissing &&
      this.dynamicProperty.emptyIfNotResolvable
    ) {
      this.updateDynamicPropertyValue(
        this.dynamicProperty.name,
        "",
        "deletion due to missing merge field value"
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

  updateDynamicPropertyValue(propertyName, newValue, logInfo) {
    if (this.targetComponent[propertyName] === newValue) {
      Logger.logMessage(
        "property-updated",
        `${propertyName}: "${newValue}" (${logInfo}) - (no difference - update skipped)`
      );
      return;
    }
    Logger.logMessage(
      "property-updated",
      `${propertyName}: "${newValue}" (${logInfo})`
    );
    this.targetComponent[propertyName] = newValue;
  }
}
