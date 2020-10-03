/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-25-2020   Oliver Preuschl                      Initial Version
 **/

import { api } from "lwc";

import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";

export default class DeclarativeRecordViewForm extends LightningElementWithDistributedApplicationState {
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
}
