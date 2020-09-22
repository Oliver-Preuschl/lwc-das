/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-20-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { LightningElement, wire } from "lwc";
import {
  publish,
  subscribe,
  unsubscribe,
  MessageContext,
  APPLICATION_SCOPE
} from "lightning/messageService";
import StateUpdateMessage from "@salesforce/messageChannel/DistributedApplicationStateUpdate__c";

//Custom JS
import MergeFieldExtractor from "c/mergeFieldExtractor";
import MergeFieldDynamicPropertyUpdater from "c/mergeFieldDynamicPropertyUpdater";

export default class LightningElementWithDistributedApplicationState extends LightningElement {
  //Wired Properties--------------------------------------------------------------------------
  @wire(MessageContext) _messageContext;

  //Static Properties-------------------------------------------------------------------------
  static currentId = 0;

  //Private Properties------------------------------------------------------------------------
  id;
  stateUpdateSubscription;
  state = {};
  dynamicProperties = [];
  monitoredStateProperties = {};
  monitorAllStateProperties = false;
  stateUpdateCallback;
  mergeFieldDynamicPropertyUpdater;
  isInitialized = false;

  //Private Methods---------------------------------------------------------------------------
  constructor() {
    super();
    this.id = ++LightningElementWithDistributedApplicationState.currentId;
    this.mergeFieldDynamicPropertyUpdater = new MergeFieldDynamicPropertyUpdater(
      this
    );
  }

  renderedCallback() {
    if (!this.stateUpdateSubscription) {
      this.stateUpdateSubscription = subscribe(
        this._messageContext,
        StateUpdateMessage,
        (stateUpdate) => {
          this.handleStateChange(stateUpdate);
        },
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  disconnectedCallback() {
    unsubscribe(this.stateUpdateSubscription);
  }

  registerAllDynamicProperties(callback) {
    this.monitorAllStateProperties = true;
    this.stateUpdateCallback = callback;
    this.initDynamicPropertyValues();
    this.startGroup("lwc-das", "Dynamic Properties registered and initialized");
    this.logMessage("context", `${this.constructor.name}:id-${this.id}`);
    this.logMessage("properties", "All");
    this.endGroup();
  }

  registerDynamicProperties(properties) {
    properties.forEach((property) => {
      this.registerDynamicProperty(property);
    });
    this.initDynamicPropertyValues();
    this.startGroup("lwc-das", "Dynamic Properties registered and initialized");
    this.logMessage("context", `${this.constructor.name}:id-${this.id}`);
    this.logMessage(
      "properties",
      `${JSON.stringify(this.monitoredStateProperties)}`
    );
    this.endGroup();
  }

  registerDynamicProperty(property) {
    let propertyValue = this[property.name];
    let foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    if (foundMergeFields.length > 0) {
      property.originalValue = propertyValue;
      this.dynamicProperties.push(property);
      foundMergeFields.forEach((foundMergeField) => {
        this.monitoredStateProperties[foundMergeField] = propertyValue;
      });
      if (property.emptyIfNotResolvable) {
        this[property.name] = "";
      }
    }
  }

  publishStateChange(propertyName, propertyValue) {
    this.startGroup("lwc-das", "Publish State Update");
    this.logMessage("context", `${this.constructor.name}:id-${this.id} -> All`);
    this.logMessage("data", `${propertyName}: ${propertyValue}`);
    publish(this._messageContext, StateUpdateMessage, {
      property: {
        name: propertyName,
        value: propertyValue
      },
      publisherId: this.id
    });
    this.endGroup();
  }

  initDynamicPropertyValues() {
    this.dynamicProperties.forEach((dynamicProperty) => {
      this.mergeFieldDynamicPropertyUpdater.initDynamicPropertyValue(
        dynamicProperty
      );
    });
    this.isInitialized = true;
    this.dispatchEvent(new CustomEvent("initialize"));
  }

  handleStateChange({ property, publisherId }) {
    if (publisherId === this.id) {
      return;
    }
    this.startGroup("Handle State Change", "");
    this.logMessage(
      "context",
      `id-${publisherId} -> id-${this.id} (${this.constructor.name})`
    );
    this.logMessage("data", `${property.name}: ${property.value}`);
    if (this.monitorAllStateProperties) {
      this.stateUpdateCallback(property);
    }
    if (this.isPropertyMonitored(property)) {
      this.updateState(property);
      this.updateDynamicPropertyValuesFromState();
    }
    this.endGroup();
  }

  isPropertyMonitored(property) {
    return this.monitoredStateProperties[property.name];
  }

  updateState(property) {
    this.state[property.name] = property.value;
  }

  updateDynamicPropertyValuesFromState() {
    this.startGroup("property-updates", "");
    this.dynamicProperties.forEach((dynamicProperty) => {
      this.mergeFieldDynamicPropertyUpdater.updateDynamicPropertyValueFromState(
        dynamicProperty
      );
    });
    console.groupEnd();
  }

  startGroup(title, message) {
    console.group(
      `%c[${title}] [${message}]%c`,
      "font-weight: bold;",
      "font-weight: normal;"
    );
  }

  logMessage(title, message) {
    console.log(
      `%c[${title}]%c ${message}`,
      "font-weight: bold;",
      "font-weight: normal;"
    );
  }

  endGroup(title, message) {
    console.groupEnd();
  }
}
