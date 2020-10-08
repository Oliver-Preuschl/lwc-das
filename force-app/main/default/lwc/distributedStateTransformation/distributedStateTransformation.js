/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-20-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { LightningElement, api } from "lwc";
import { DistributedApplicationStateMixin } from "c/distributedApplicationState";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

//Custom JS
import Logger from "c/logger";
import DynamicPropertyUpdater from "c/dynamicPropertyUpdater";

//Apex
import getPropertyTransformationsByName from "@salesforce/apex/DistributedStateTransformation.getPropertyTransformationsByName";

export default class DeclarativeStateTransformation extends DistributedApplicationStateMixin(
  LightningElement
) {
  //Public Properties-------------------------------------------------------------------------
  @api stateTransformationName;

  //Private Properties------------------------------------------------------------------------
  propertyTransfomations;

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    getPropertyTransformationsByName({ name: this.stateTransformationName })
      .then((propertyTransformations) => {
        console.log("propertyTransformations", propertyTransformations);
        this.propertyTransfomations = propertyTransformations;
        this.initState({ stateUpdateCallback: this.handleStateUpdate });
      })
      .catch((error) => {
        Logger.startErrorGroup("State Transformation", "Query Error");
        Logger.logMessage("context", `${this.constructor.name}:id-${this.id}`);
        Logger.logMessage("message", JSON.stringify(error));
        Logger.endGroup();
        this.isLoading = false;
        this.showErrorToast("Error", error.body.message);
      });
  }

  //Private Methods---------------------------------------------------------------------------
  handleStateUpdate(property) {
    Logger.startGroup("lwc-das", "state-transform");
    Logger.logMessage("name", this.stateTransformationName);
    Logger.logMessage("property", `${property.name}: ${property.value}`);
    this.updateState(property);
    this.propertyTransfomations.forEach((propertyTransformation) => {
      if (
        (propertyTransformation.SourcePropertyName__c === property.name &&
          propertyTransformation.SourceValue__c === property.value) ||
        propertyTransformation.IsDynamic__c
      ) {
        Logger.startGroup(
          "property-transform",
          JSON.stringify(propertyTransformation)
        );
        let propertyTransformationTargetValue =
          propertyTransformation.TargetValue__c;
        if (propertyTransformation.IsDynamic__c) {
          const dynamicProperty = {
            name: propertyTransformation.TargetPropertyName__c,
            originalValue: propertyTransformation.TargetValue__c,
            emptyIfNotResolvable: true
          };
          const dynamicPropertyUpdater = new DynamicPropertyUpdater(
            this,
            dynamicProperty
          );
          propertyTransformationTargetValue = dynamicPropertyUpdater.getMergedDynamicPropertyValue();
        }
        if (
          this.internalState[propertyTransformation.TargetPropertyName__c] !==
          propertyTransformationTargetValue
        ) {
          Logger.logMessage(
            "dynamic-property-updated",
            `${propertyTransformation.TargetPropertyName__c}: ${propertyTransformationTargetValue}`
          );
          this.publishStateChange(
            propertyTransformation.TargetPropertyName__c,
            propertyTransformationTargetValue
          );
        }
        Logger.endGroup();
      }
    });
    Logger.endGroup();
  }

  showErrorToast(title, message) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: "error"
    });
    this.dispatchEvent(evt);
  }
}
