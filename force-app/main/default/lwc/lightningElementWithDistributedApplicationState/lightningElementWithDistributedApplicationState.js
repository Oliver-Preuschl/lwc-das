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
import STATE_UPDATE_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateUpdate__c";
import STATE_INIT_REQUEST_MESSAGE from "@salesforce/messageChannel/DistributedApplicationStateInitRequest__c";

//Custom JS
import Logger from "c/logger";
import MergeFieldExtractor from "c/mergeFieldExtractor";
import DynamicPropertyUpdater from "c/dynamicPropertyUpdater";

export default class LightningElementWithDistributedApplicationState extends LightningElement {
  //Wired Properties--------------------------------------------------------------------------
  @wire(MessageContext) messageContext;

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
      this.messageContext,
      STATE_UPDATE_MESSAGE,
      (stateUpdate) => {
        this.handleStateChange(stateUpdate);
      },
      { scope: APPLICATION_SCOPE }
    );
    this.stateInitRequestSubscription = subscribe(
      this.messageContext,
      STATE_INIT_REQUEST_MESSAGE,
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

  registerDynamicProperty(property) {
    const propertyValue = this[property.name];
    const foundMergeFields = MergeFieldExtractor.extractMergeFields(
      propertyValue
    );
    if (foundMergeFields.length > 0) {
      property.originalValue = propertyValue;
      this.dynamicProperties.push(property);
      foundMergeFields.forEach((foundMergeField) => {
        this.monitoredStateProperties[foundMergeField] = propertyValue;
      });
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

  publishStateChange(propertyName, propertyValue) {
    if (!this.isInitialized) {
      Logger.logMessage(
        "lwc-das",
        "Publish State Update ignored (Initialization not completed)"
      );
    }
    Logger.startGroup("lwc-das", "Publish State Update");
    Logger.logMessage(
      "context",
      `${this.constructor.name}:id-${this.id} -> All`
    );
    Logger.logMessage("data", `${propertyName}: ${propertyValue}`);
    this.internalState[propertyName] = propertyValue;
    publish(this.messageContext, STATE_UPDATE_MESSAGE, {
      property: {
        name: propertyName,
        value: propertyValue
      },
      publisher: { name: this.constructor.name, id: this.id }
    });
    Logger.endGroup();
  }

  handleStateChange({ property, publisher }) {
    if (publisher.id === this.id) {
      return;
    }
    if (this.monitorAllStateProperties) {
      Logger.startGroup("Handle State Change", "");
      Logger.logMessage(
        "context",
        `${publisher.name}:id-${publisher.id} -> ${this.constructor.name}:id-${this.id}`
      );
      this.stateUpdateCallback(property);
      Logger.endGroup();
    }
    if (this.isPropertyMonitored(property)) {
      Logger.startGroup("Handle State Change", "");
      Logger.logMessage(
        "context",
        `${publisher.name}:id-${publisher.id} -> ${this.constructor.name}:id-${this.id}`
      );
      Logger.logMessage("data", `${property.name}: ${property.value}`);
      this.updateState(property);
      this.updateDynamicPropertyValuesFromState();
      Logger.endGroup();
    }
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
    publish(this.messageContext, STATE_INIT_REQUEST_MESSAGE, {
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
    for (let propertyName in this.internalState) {
      if (
        Object.prototype.hasOwnProperty.call(this.internalState, propertyName)
      ) {
        this.publishStateChange(propertyName, this.internalState[propertyName]);
      }
    }
    Logger.endGroup();
  }
}
