/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-20-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { api } from "lwc";
import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";

//Apex
import getRecords from "@salesforce/apex/DataTableRecordFinder.getRecords";

export default class DeclarativeDataTable extends LightningElementWithDistributedApplicationState {
  //Public Properties-------------------------------------------------------------------------
  @api
  get sObjectName() {
    return this._sObjectName;
  }
  set sObjectName(value) {
    this._sObjectName = value;
    this.queryRecords(++this.queryIdentifier);
  }

  @api
  get fields() {
    return this._fields;
  }
  set fields(value) {
    this._fields = value;
    this.buildColumns();
    this.queryRecords(++this.queryIdentifier);
  }

  @api
  get criteria() {
    return this._criteria;
  }
  set criteria(value) {
    this._criteria = value;
    this.queryRecords(++this.queryIdentifier);
  }

  @api
  get recordLimit() {
    return this._recordLimit;
  }
  set recordLimit(value) {
    this._recordLimit = value;
    this.queryRecords(++this.queryIdentifier);
  }

  @api showAllRecordsWhenCriteriaIsMissing = false;

  @api selectedRecordIdsAttributeName;

  //Private Properties------------------------------------------------------------------------
  _sObjectName;
  _fields;
  _criteria;
  _recordLimit;
  columns = [];
  records = [];
  selectedRecordIds = [];
  queryIdentifier = 0;
  isLoading = false;

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    this.registerDynamicProperties([
      { name: "sObjectName", emptyIfNotResolvable: true },
      { name: "fields", emptyIfNotResolvable: true },
      { name: "criteria", emptyIfNotResolvable: true },
      { name: "recordLimit", emptyIfNotResolvable: true }
    ]);
    this.queryRecords(++this.queryIdentifier);
  }

  //Private Methods---------------------------------------------------------------------------
  buildColumns() {
    this.columns = this.fields.split(",").map((fieldName) => {
      return { label: fieldName.trim(), fieldName: fieldName.trim() };
    });
  }

  queryRecords(queryIdentifier) {
    if (
      !this.isInitialized ||
      !this.sObjectName ||
      !this.fields ||
      (!this.criteria && !this.showAllRecordsWhenCriteriaIsMissing)
    ) {
      /*console.log(
        `x queryRecords: ${this.constructor.name} (${this.id}), ${this.sObjectName}, ${this.fields}, ${this.criteria}, ${this.recordLimit} (${queryIdentifier})`
      );*/
      this.records = [];
      return;
    }
    /*console.log(
      `-> queryRecords: ${this.constructor.name} (${this.id}), ${this.sObjectName}, ${this.fields}, ${this.criteria}, ${this.recordLimit} (${queryIdentifier})`
    );*/
    this.isLoading = true;
    getRecords({
      sObjectName: this.sObjectName,
      fields: this.fields,
      criteria: this.criteria,
      recordLimit: this.recordLimit
    })
      .then((records) => {
        if (this.queryIdentifier === queryIdentifier) {
          //console.log(queryIdentifier);
          //console.log(records);
          this.records = records;
        }
        this.isLoading = false;
      })
      .catch((error) => {
        //console.log(queryIdentifier);
        console.log(error);
        this.isLoading = false;
      });
  }

  //Handlers-----------------------------------------------------------------------------------
  handleRowSelection(event) {
    const selectedRows = event.detail.selectedRows;
    const selectedRecordIds = [];
    for (let i = 0; i < selectedRows.length; i++) {
      selectedRecordIds.push(selectedRows[i].Id);
    }
    this.selectedRecordIds = selectedRecordIds;
    const recordSelectionChangedEvent = new CustomEvent(
      "recordselectionchange",
      {
        detail: { recordIds: this.selectedRecordIds }
      }
    );
    this.dispatchEvent(recordSelectionChangedEvent);
    const selectedRecordIdsString =
      this.selectedRecordIds.length > 0
        ? `'${this.selectedRecordIds.join("','")}'`
        : null;
    this.publishStateChange(
      this.selectedRecordIdsAttributeName,
      selectedRecordIdsString
    );
  }
}
