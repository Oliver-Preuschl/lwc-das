[![Github Workflow](https://github.com/Oliver-Preuschl/lwc-das/workflows/CI/badge.svg?branch=master)](https://github.com/Oliver-Preuschl/lwc-das/actions)
[![codecov](https://codecov.io/gh/Oliver-Preuschl/lwc-das/branch/master/graph/badge.svg?token=DFPZ7G6N9G)](https://codecov.io/gh/Oliver-Preuschl/lwc-das)
![GitHub](https://img.shields.io/github/license/Oliver-Preuschl/lwc-das)

# Overview

lwc-das supports building generic, loosely coupled Lightning Web Components (LWCs). The communication between these components can be configured directly in the Lightning App Builder using outgoing and incoming properties, instead of sending dedicated messages between the single components. This leads to a much higher component reusability and cleaner component architecture.

For a detailed explanation of the motivation behind this project and an overview of the architecture please read the the article [Loose Coupling of LWCs in the Lightning App Builder](https://medium.com/p/a1b37cad3575) on Medium.

# Installation

## Installation in a scratch org (with examples)

1. Clone the repository

   ```bash
   git clone https://github.com/Oliver-Preuschl/lwc-das
   cd lwc-das
   ```

1. Push to your scratch org

   ```bash
   sfdx force:org:create -s -f config/project-scratch-def.json -a lwc-das
   ```

1. Import the sample data

   ```bash
   sfdx force:data:tree:import -p ./data/sample-data-plan.json
   ```

1. Open the scratch org

   ```bash
   sfdx force:org:open
   ```

## Installation in any org (without examples)

To install lwc-das in a sandbox or production org using an unlocked package please use [this]() link. Note that this will just install the library itself, not the example components and the example application.

# Usage in the Lightning App Builder

Components build with lwc-das usually provide incoming and outgoing properties. You can set the name for an outgoing property in the Lightning App Builder and then refer to this property in the incoming properties of any other component in the page. This enables communication between these components without modifying the component itself. The outgoing properties have to be surrounded by curly brackets when used in incoming properties. The following illustration explains this concept based on an example application which displays 3 interconnected components.

- An account data table which displays all available accounts.
- A contact data table, which displays all contacts for the selected accounts.
- A location map component, which displays the locations of the selected accounts.

![Component configuration in the Lightning App Builder](images/lab-config-1.png)

1. The account data table specifies the outgoing property _selectedAccountIds_
2. This property is then used in the incoming property _criteria_ to filter the contact records in the contact data table.
3. The same property is used to pass the account ids to the location map component.

# Implementation

The easiest way to enable a component for communication using properties is to simply wrap an existing component. Please find following an overview of the necessary steps to wrap the _lightning-map_ component.

1. Wrap the desired Component

   ```js
   <template>
     <lightning-card title={cardTitle}>
       <p class="slds-p-horizontal_small">
         <lightning-map
           map-markers={mapMarkers}
           list-view="hidden"
           onmarkerselect={handleMarkerSelect}
         ></lightning-map>
       </p>
     </lightning-card>
   </template>
   ```

1. Extend LightningElement instead of LightningElementWithDistributedApplicationState.

   ```js
   import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";

   export default class DeclarativeAddressMap extends LightningElementWithDistributedApplicationState {
     ...
   }
   ```

1. Declare the (incoming) dynamic properties and the outgoing properties.

   ```js
   //Incoming
   @api cardTitle;
   @api sObjectApiName;
   @apiaddressFieldName;
   @api recordIds;

   //Outgoing
   @api selectedMarkerValuePropertyName;
   ```

1. Register the dynamic properties of your component, to make sure [lwc-das](https://github.com/Oliver-Preuschl/lwc-das) will update these properties whenever the state gets updated by another component.

   ```js
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
   ```

1. Publish state changes of your component.

   ```js
   handleMarkerSelect(event) {
     this.publishStateChange(
       this.selectedMarkerValuePropertyName,
       event.detail.selectedMarkerValue
     );
   }
   ```

# Component Object and Record Context

To ensure you can also use your components on record pages lwc-das provides the possibility to use the public properties _sObjectApiName_ and _recordId_ in your incoming properties.
You could, for example, use the following value for the property _criteria_ of a contacts data table on the account record page to show all contacts related to this account: `AccountId = '{recordId}'`

# State transformations

