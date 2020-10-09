/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-25-2020   Oliver Preuschl                      Initial Version
 **/

import { LightningElement, api } from "lwc";
import { DistributedApplicationStateMixin } from "c/distributedApplicationState";

export default class DeclarativeRecordViewForm extends DistributedApplicationStateMixin(
  LightningElement
) {
  @api cardTitle;
  @api recordId;
  @api sObjectApiName;
  @api fields;

  get fieldApiNames() {
    return this.fields ? this.fields.split(",") : "";
  }

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    this.initState({
      dynamicProperties: [
        { name: "cardTitle", emptyIfNotResolvable: true },
        { name: "recordId", emptyIfNotResolvable: true },
        { name: "sObjectApiName", emptyIfNotResolvable: true },
        { name: "fields", emptyIfNotResolvable: true }
      ]
    });
  }

  disconnectedCallback() {
    this.stopStateHandling();
  }
}
