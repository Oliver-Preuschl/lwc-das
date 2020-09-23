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
import StateInitRequestMessage from "@salesforce/messageChannel/DistributedApplicationStateInitRequest__c";

//Custom JS
import Logger from "c/logger";
import MergeFieldExtractor from "c/mergeFieldExtractor";
import DynamicPropertyUpdater from "c/dynamicPropertyUpdater";

export default class LightningElementWithDistributedApplicationState extends LightningElement {
  //Wired Properties--------------------------------------------------------------------------
  @wire(MessageContext) _messageContext;

  //Static Properties-------------------------------------------------------------------------
  static currentId = 0;

  //Private Properties------------------------------------------------------------------------
  id;
  stateUpdateSubscription;
  internalState = {};
  externalState = {};
  dynamicProperties = [];
  monitoredStateProperties = {};
  monitorAllStateProperties = false;
  stateUpdateCallback;
  isInitialized = false;

  //Lifecycle Methods---------------------------------------------------------------------------
  constructor() {
    super();
    this.id = ++LightningElementWithDistributedApplicationState.currentId;
  }

  renderedCallback() {
    if (!this.stateUpdateSubscription) {
    }
  }

  disconnectedCallback() {
    unsubscribe(this.stateUpdateSubscription);
  }

  //Private Methods---------------------------------------------------------------------------
  initState({ dynamicProperties = null, stateUpdateCallback = null }) {
    if (dynamicProperties) {
      this.registerDynamicProperties(dynamicProperties);
    }
    if (stateUpdateCallback) {
      this.registerAllDynamicProperties(stateUpdateCallback);
    }
    this.registerMessageHandlers();
    this.requestStateInit();
  }

  registerMessageHandlers() {
    this.stateUpdateSubscription = subscribe(
      this._messageContext,
      StateUpdateMessage,
      (stateUpdate) => {
        this.handleStateChange(stateUpdate);
      },
      { scope: APPLICATION_SCOPE }
    );
    this.stateInitRequestSubscription = subscribe(
      this._messageContext,
      StateInitRequestMessage,
      (stateInitRequest) => {
        this.handleStateInitRequest(stateInitRequest);
      },
      { scope: APPLICATION_SCOPE }
    );
  }

  registerAllDynamicProperties(callback) {
    this.monitorAllStateProperties = true;
    this.stateUpdateCallback = callback;
    this.initDynamicPropertyValues();
    Logger.startGroup(
      "lwc-das",
      "Dynamic Properties registered and initialized"
    );
    Logger.logMessage("context", `${this.constructor.name}:id-${this.id}`);
    Logger.logMessage("properties", "All");
    Logger.endGroup();
  }

  registerDynamicProperties(properties) {
    properties.forEach((property) => {
      this.registerDynamicProperty(property);
    });
    this.initDynamicPropertyValues();
    Logger.startGroup(
      "lwc-das",
      "Dynamic Properties registered and initialized"
    );
    Logger.logMessage("context", `${this.constructor.name}:id-${this.id}`);
    Logger.logMessage(
      "properties",
      `${JSON.stringify(this.monitoredStateProperties)}`
    );
    Logger.endGroup();
  }

  publishStateChange(propertyName, propertyValue) {
    Logger.startGroup("lwc-das", "Publish State Update");
    Logger.logMessage(
      "context",
      `${this.constructor.name}:id-${this.id} -> All`
    );
    Logger.logMessage("data", `${propertyName}: ${propertyValue}`);
    this.internalState[propertyName] = propertyValue;
    publish(this._messageContext, StateUpdateMessage, {
      property: {
        name: propertyName,
        value: propertyValue
      },
      publisher: { name: this.constructor.name, id: this.id }
    });
    Logger.endGroup();
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

  initDynamicPropertyValues() {
    this.dynamicProperties.forEach((dynamicProperty) => {
      const dynamicPropertyUpdater = new DynamicPropertyUpdater(
        this,
        dynamicProperty
      );
      dynamicPropertyUpdater.initDynamicPropertyValue();
    });
    this.isInitialized = true;
    this.dispatchEvent(new CustomEvent("initialize"));
  }

  handleStateChange({ property, publisher }) {
    if (publisher.id === this.id) {
      return;
    }
    Logger.startGroup("Handle State Change", "");
    Logger.logMessage(
      "context",
      `${publisher.name}:id-${publisher.id} -> ${this.constructor.name}:id-${this.id}`
    );
    Logger.logMessage("data", `${property.name}: ${property.value}`);
    if (this.monitorAllStateProperties) {
      this.stateUpdateCallback(property);
    }
    if (this.isPropertyMonitored(property)) {
      this.updateState(property);
      this.updateDynamicPropertyValuesFromState();
    }
    Logger.endGroup();
  }

  isPropertyMonitored(property) {
    return this.monitoredStateProperties[property.name];
  }

  updateState(property) {
    this.externalState[property.name] = property.value;
  }

  updateDynamicPropertyValuesFromState() {
    Logger.startGroup("property-updates", "");
    this.dynamicProperties.forEach((dynamicProperty) => {
      const dynamicPropertyUpdater = new DynamicPropertyUpdater(
        this,
        dynamicProperty
      );
      dynamicPropertyUpdater.updateDynamicPropertyValueFromState();
    });
    console.groupEnd();
  }

  requestStateInit() {
    Logger.startGroup("lwc-das", "Request State Init");
    Logger.logMessage(
      "context",
      `${this.constructor.name}:id-${this.id} -> All`
    );
    publish(this._messageContext, StateInitRequestMessage, {
      requester: { name: this.constructor.name, id: this.id }
    });
    Logger.endGroup();
  }

  handleStateInitRequest({ requester }) {
    if (requester.id === this.id) {
      return;
    }
    Logger.startGroup("Handle State Init Request", "");
    Logger.logMessage(
      "context",
      `${requester.name}:id-${requester.id} -> ${this.constructor.name}:id-${this.id}`
    );
    //console.log(this.internalState);
    for (let propertyName in this.internalState) {
      //console.log(`${propertyName}: ${his.internalState[propertyName]}`);
      if (this.internalState.hasOwnProperty(propertyName)) {
        this.publishStateChange(propertyName, this.internalState[propertyName]);
      }
    }
    Logger.endGroup();
  }
}
