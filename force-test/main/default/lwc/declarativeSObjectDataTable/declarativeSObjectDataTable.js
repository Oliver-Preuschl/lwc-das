/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-28-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { LightningElement, api } from "lwc";
import { DistributedApplicationStateMixin } from "c/distributedApplicationState";

export default class DeclarativeDataTable extends DistributedApplicationStateMixin(
  LightningElement
) {
  //Public Properties-------------------------------------------------------------------------
  @api cardTitle;
  @api sObjectName;
  @api fields;
  @api criteria;
  @api recordLimit;
  @api showAllRecordsWhenCriteriaIsMissing = false;
  @api heightInPx = "500";

  @api selectedRecordIdsPropertyName;

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    this.startStateHandling({
      dynamicProperties: [
        { name: "cardTitle", emptyIfNotResolvable: true },
        { name: "sObjectName", emptyIfNotResolvable: true },
        { name: "fields", emptyIfNotResolvable: true },
        { name: "criteria", emptyIfNotResolvable: true },
        { name: "recordLimit", emptyIfNotResolvable: true },
        { name: "selectedRecordIdsPropertyName", emptyIfNotResolvable: true }
      ]
    });
  }

  disconnectedCallback() {
    this.stopStateHandling();
  }

  //Handlers------------------------------------------------------------------------------------
  handlerecordselectionchange(event) {
    const selectedRecordIds = event.detail.recordIds;
    const selectedRecordIdsString =
      selectedRecordIds.length > 0
        ? `'${selectedRecordIds.join("','")}'`
        : null;
    if (this.selectedRecordIdsPropertyName) {
      this.publishStateChange(
        this.selectedRecordIdsPropertyName,
        selectedRecordIdsString
      );
    }
  }
}
