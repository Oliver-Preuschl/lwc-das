/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-20-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { LightningElement, api } from "lwc";

//Custom JS
import Logger from "c/logger";

//Apex
import getRecords from "@salesforce/apex/RecordFinder.getRecords";

export default class DeclarativeDataTable extends LightningElement {
  //Public Properties-------------------------------------------------------------------------
  @api cardTitle;

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

  @api heightInPx = "500";

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

  //Getters-----------------------------------------------------------------------------------
  get containerStyle() {
    return `height: ${this.heightInPx}px;`;
  }

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    this.queryRecords(++this.queryIdentifier);
  }

  //Private Methods---------------------------------------------------------------------------
  buildColumns() {
    if (!this.fields) {
      return;
    }
    this.columns = this.fields.split(",").map((fieldName) => {
      return { label: fieldName.trim(), fieldName: fieldName.trim() };
    });
  }

  queryRecords(queryIdentifier) {
    if (
      !this.sObjectName ||
      !this.fields ||
      (!this.criteria && !this.showAllRecordsWhenCriteriaIsMissing)
    ) {
      this.records = [];
      return;
    }
    this.isLoading = true;
    getRecords({
      sObjectApiName: this.sObjectName,
      fields: this.fields,
      criteria: this.criteria,
      recordLimit: this.recordLimit
    })
      .then((records) => {
        if (this.queryIdentifier === queryIdentifier) {
          this.records = records;
        }
        this.isLoading = false;
      })
      .catch((error) => {
        Logger.startErrorGroup("DataTable", "Data Query Error");
        Logger.logMessage(
          "context",
          `${this.constructor.name}:id-${this.id}:qid:${queryIdentifier}`
        );
        Logger.logMessage("message", JSON.stringify(error));
        this.isLoading = false;
        Logger.endGroup();
      });
  }

  //Handlers-----------------------------------------------------------------------------------
  handleRowSelection(event) {
    const selectedRows = event.detail.selectedRows;
    this.selectedRecordIds = selectedRows.map((selectedRow) => selectedRow.Id);
    const recordSelectionChangedEvent = new CustomEvent(
      "recordselectionchange",
      {
        detail: { recordIds: this.selectedRecordIds }
      }
    );
    this.dispatchEvent(recordSelectionChangedEvent);
  }
}
