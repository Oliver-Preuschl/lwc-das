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
    this.initState({ stateUpdateCallback: this.handleStateUpdate });
    getTransformationByName({ name: this.stateTransformationName })
      .then((propertyTransformations) => {
        this.propertyTransfomations = propertyTransformations;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  //Private Methods---------------------------------------------------------------------------
  handleStateUpdate(property) {
    Logger.startGroup("lwc-das", "property-transform");
    console.logMessage("data", `${property.name}: ${property.value}`);
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
  }
}
