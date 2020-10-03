/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-25-2020   Oliver Preuschl                      Initial Version
 **/

import { api } from "lwc";
import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";

//Apex
import getRecords from "@salesforce/apex/RecordFinder.getRecords";

export default class DeclarativeAddressMap extends LightningElementWithDistributedApplicationState {
  //Public Properties-------------------------------------------------------------------------
  @api cardTitle;

  @api
  get sObjectApiName() {
    return this._sObjectApiName;
  }
  set sObjectApiName(value) {
    this._sObjectApiName = value;
    this.calculateMarkers();
  }

  @api
  get addressFieldName() {
    return this._addressFieldName;
  }
  set addressFieldName(value) {
    this._addressFieldName = value;
    this.calculateMarkers();
  }

  @api
  get recordIds() {
    return this._recordIds;
  }
  set recordIds(value) {
    this._recordIds = value;
    this.calculateMarkers();
  }

  @api selectedMarkerValuePropertyName;

  //Private Properties-------------------------------------------------------------------------
  _sObjectApiName;
  _addressFieldName;
  _recordIds;
  mapMarkers;

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    this.initState({
      dynamicProperties: [
        { name: "cardTitle", emptyIfNotResolvable: true },
        { name: "sObjectApiName", emptyIfNotResolvable: true },
        { name: "addressFieldName", emptyIfNotResolvable: true },
        { name: "recordIds", emptyIfNotResolvable: true }
      ]
    });
  }

  //Handlers----------------------------------------------------------------------------------
  handleMarkerSelect(event) {
    this.publishStateChange(
      this.selectedMarkerValuePropertyName,
      event.detail.selectedMarkerValue
    );
  }

  //Private Methods---------------------------------------------------------------------------
  async calculateMarkers() {
    if (
      !this.sObjectApiName ||
      !this.addressFieldName ||
      !this.recordIds ||
      this.recordIds.length === 0 ||
      !this.isInitialized
    ) {
      this.mapMarkers = [];
      return;
    }
    const records = await getRecords({
      sObjectApiName: this.sObjectApiName,
      fields: `Name, ${this.addressFieldName}`,
      criteria: `Id IN ${this.recordIds}`
    });
    this.mapMarkers = records
      .filter((record) => record[this.addressFieldName])
      .map((record) => {
        return {
          value: record.Id,
          title: record.Name,
          location: {
            Street: record[this.addressFieldName].street,
            City: record[this.addressFieldName].city,
            Country: record[this.addressFieldName].country
          }
        };
      });
    if (this.selectedMarkerValuePropertyName) {
      this.publishStateChange(this.selectedMarkerValuePropertyName, "");
    }
  }
}
