/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-21-2020   Oliver Preuschl                      Initial Version
 **/
export default class MergeFieldDynamicPropertyUpdater {
  targetComponent;
  state;

  constructor(targetComponent) {
    this.targetComponent = targetComponent;
    this.state = targetComponent.state;
  }

  initDynamicPropertyValue(dynamicProperty) {
    const matches = this.getMergeFieldMatches(dynamicProperty);
    if (!!matches) {
      this.targetComponent[dynamicProperty.name] = "";
    }
  }

  updateDynamicPropertyValueFromState(dynamicProperty) {
    if (!dynamicProperty.originalValue) {
      return;
    }
    const matches = this.getMergeFieldMatches(dynamicProperty);
    if (!matches) {
      return;
    }
    const {
      updatedDynamicPropertyValue,
      wasMergeFieldFound,
      isMergeFieldValueMissing
    } = this.updateDynamicPropertyValuesForMatchGroup(dynamicProperty, matches);
    if (
      wasMergeFieldFound &&
      (!isMergeFieldValueMissing || !dynamicProperty.emptyIfNotResolvable)
    ) {
      this.updateDynamicPropertyValue(
        dynamicProperty.name,
        updatedDynamicPropertyValue,
        "current state value(s)"
      );
    } else if (
      !wasMergeFieldFound &&
      this.targetComponent[dynamicProperty.name] !==
        dynamicProperty.originalValue
    ) {
      this.updateDynamicPropertyValue(
        dynamicProperty.name,
        dynamicProperty.originalValue,
        "reset to orignial value"
      );
    } else if (
      isMergeFieldValueMissing &&
      dynamicProperty.emptyIfNotResolvable
    ) {
      this.updateDynamicPropertyValue(
        dynamicProperty.name,
        "",
        "deletion due to missing merge field value"
      );
    }
  }

  getMergeFieldMatches(dynamicProperty) {
    return dynamicProperty.originalValue.matchAll(
      /(?<mergeFieldWithBrackets>{.*?})/gi
    );
  }

  updateDynamicPropertyValuesForMatchGroup(dynamicProperty, matches) {
    let updatedDynamicPropertyValue = dynamicProperty.originalValue;
    let wasMergeFieldFound = false;
    let isMergeFieldValueMissing = false;
    for (let match of matches) {
      if (!match.groups) {
        continue;
      }
      wasMergeFieldFound = true;
      if (MergeFieldDynamicPropertyUpdater.isIterable(match.groups)) {
        for (let group of match.groups) {
          const updateResult = this.updateDynamicPropertyValueWithMergeFieldValue(
            dynamicProperty,
            group.mergeFieldWithBrackets,
            updatedDynamicPropertyValue
          );
          updatedDynamicPropertyValue =
            updateResult.updatedDynamicPropertyValue;
          isMergeFieldValueMissing =
            isMergeFieldValueMissing || updateResult.isMergeFieldValueMissing;
        }
      } else {
        const updateResult = this.updateDynamicPropertyValueWithMergeFieldValue(
          dynamicProperty,
          match.groups.mergeFieldWithBrackets,
          updatedDynamicPropertyValue
        );
        updatedDynamicPropertyValue = updateResult.updatedDynamicPropertyValue;
        isMergeFieldValueMissing =
          isMergeFieldValueMissing || updateResult.isMergeFieldValueMissing;
      }
    }
    return {
      updatedDynamicPropertyValue,
      wasMergeFieldFound,
      isMergeFieldValueMissing
    };
  }

  static isIterable(obj) {
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === "function";
  }

  updateDynamicPropertyValueWithMergeFieldValue(
    dynamicProperty,
    mergeFieldWithBrackets,
    updatedDynamicPropertyValue
  ) {
    const mergeField = mergeFieldWithBrackets.replace("{", "").replace("}", "");
    if (!this.isMergeFieldAvailableInState(mergeField)) {
      if (!dynamicProperty.emptyIfNotResolvable) {
        updatedDynamicPropertyValue = updatedDynamicPropertyValue.replace(
          mergeFieldWithBrackets,
          ""
        );
        /*this.updateDynamicPropertyValue(
          dynamicProperty.name,
          updatedDynamicPropertyValue,
          "not found in state"
        );*/
      }
      return { updatedDynamicPropertyValue, isMergeFieldValueMissing: true };
    }
    updatedDynamicPropertyValue = updatedDynamicPropertyValue.replace(
      mergeFieldWithBrackets,
      this.state[mergeField]
    );
    /*this.updateDynamicPropertyValue(
      dynamicProperty.name,
      updatedDynamicPropertyValue,
      "current state value"
    );*/
    return { updatedDynamicPropertyValue, isMergeFieldValueMissing: false };
  }

  isMergeFieldAvailableInState(mergeField) {
    return (
      this.state[mergeField] !== undefined && this.state[mergeField] !== null
    );
  }

  updateDynamicPropertyValue(propertyName, newValue, logInfo) {
    if (this.targetComponent[propertyName] === newValue) {
      console.log(
        `%c[property-updated]%c ${propertyName}: "${newValue}" (${logInfo}) - (no difference - skipped)`,
        "font-weight: bold",
        "font-style: normal"
      );
      return;
    }
    console.log(
      `%c[property-update]%c ${propertyName}: "${newValue}" (${logInfo})`,
      "font-weight: bold",
      "font-style: normal"
    );
    this.targetComponent[propertyName] = newValue;
  }
}
