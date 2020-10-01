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
    const mergeFields = this.getMergeFields();
    if (!!mergeFields && mergeFields.length > 0) {
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

  getMergedDynamicPropertyValue() {
    if (!this.dynamicProperty.originalValue) {
      return;
    }
    const mergeField = this.getMergeFields(this.dynamicProperty);
    if (!mergeField) {
      return;
    }
    this.updateDynamicPropertyValueForMergeFields(mergeField);
    if (!this.wasMergeFieldFound || this.isMergeFieldValueMissing) {
      if (this.dynamicProperty.emptyIfNotResolvable) {
        return "";
      } else {
        return null;
      }
    } else {
      return this.updatedDynamicPropertyValue;
    }
  }

  updateDynamicPropertyValueFromState() {
    if (!this.dynamicProperty.originalValue) {
      return;
    }
    const mergeFields = this.getMergeFields();
    if (!mergeFields) {
      return;
    }
    this.updateDynamicPropertyValueForMergeFields(mergeFields);
    if (!this.wasMergeFieldFound || this.isMergeFieldValueMissing) {
      this.clearDynamicPropertyValue();
    } else {
      this.updateDynamicPropertyValue(
        this.updatedDynamicPropertyValue,
        "current state value(s)"
      );
    }
  }

  getMergeFields() {
    return !!this.dynamicProperty.originalValue
      ? this.dynamicProperty.originalValue.match(/{(.*?)}/g)
      : [];
  }

  updateDynamicPropertyValueForMergeFields(mergeFields) {
    this.updatedDynamicPropertyValue = this.dynamicProperty.originalValue;
    this.wasMergeFieldFound = false;
    this.isMergeFieldValueMissing = false;
    for (let mergeField of mergeFields) {
      this.wasMergeFieldFound = true;
      this.updateDynamicPropertyValueWithMergeFieldValue(mergeField);
    }
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
