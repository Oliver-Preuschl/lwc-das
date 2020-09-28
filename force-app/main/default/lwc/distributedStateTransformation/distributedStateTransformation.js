/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-20-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { api } from "lwc";
import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";

//Custom JS
import Logger from "c/logger";

//Apex
import getTransformationByName from "@salesforce/apex/DistributedStateTransformation.getTransformationByName";

export default class DeclarativeStateTransformation extends LightningElementWithDistributedApplicationState {
  //Public Properties-------------------------------------------------------------------------
  @api stateTransformationName;

  //Private Properties------------------------------------------------------------------------
  propertyTransfomations;

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    getTransformationByName({ name: this.stateTransformationName })
      .then((propertyTransformations) => {
        this.propertyTransfomations = propertyTransformations;
        this.initState({ stateUpdateCallback: this.handleStateUpdate });
      })
      .catch((error) => {
        Logger.startErrorGroup("State Transformation", "Query Error");
        Logger.logMessage("context", `${this.constructor.name}:id-${this.id}`);
        Logger.logMessage("message", JSON.stringify(error));
        this.isLoading = false;
        Logger.endGroup();
      });
  }

  //Private Methods---------------------------------------------------------------------------
  handleStateUpdate(property) {
    if (!this.propertyTransfomations) {
      return;
    }
    Logger.startGroup("lwc-das", "property-transform");
    Logger.logMessage("data", `${property.name}: ${property.value}`);
    this.propertyTransfomations.forEach((propertyTransformation) => {
      if (
        propertyTransformation.SourcePropertyName__c === property.name &&
        propertyTransformation.SourceValue__c === property.value
      ) {
        this.publishStateChange(
          propertyTransformation.TargetPropertyName__c,
          propertyTransformation.TargetValue__c
        );
      }
    });
    Logger.endGroup();
  }
}
