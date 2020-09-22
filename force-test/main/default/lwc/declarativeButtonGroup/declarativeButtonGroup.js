/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-20-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { api, track } from "lwc";
import LightningElementWithDistributedApplicationState from "c/lightningElementWithDistributedApplicationState";

export default class DeclarativeButtonGroup extends LightningElementWithDistributedApplicationState {
  //Public Properties-------------------------------------------------------------------------
  @api
  get buttonLabels() {
    return this._buttonLabels;
  }

  set buttonLabels(value) {
    this._buttonLabels = value;
    this.calculateButtons();
  }

  @api selectedNameAttributeName;

  //Tracked Properties
  @track buttons = [];

  //Private Properties------------------------------------------------------------------------
  _buttonLabels;
  selectedButtonIndex;

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    this.registerDynamicProperties([{ name: "buttonLabels" }]);
  }

  //Handlers----------------------------------------------------------------------------------
  handleButtonClick(event) {
    if (
      this.selectedButtonIndex !== null &&
      this.selectedButtonIndex !== undefined
    ) {
      this.buttons[this.selectedButtonIndex].selected = false;
      this.buttons[this.selectedButtonIndex].variant = "neutral";
    }
    this.selectedButtonIndex = event.target.dataset.index;
    this.buttons[this.selectedButtonIndex].selected = true;
    this.buttons[this.selectedButtonIndex].variant = "brand";
    this.publishStateChange(this.selectedNameAttributeName, event.target.name);
  }

  //Private Methods---------------------------------------------------------------------------
  calculateButtons() {
    let i = 0;
    this.buttons = this.buttonLabels.split(",").map((buttonLabel) => {
      const index = i;
      const selected = i === this.selectedButtonIndex;
      const variant = selected ? "brand" : "neutral";
      const button = {
        index,
        name: buttonLabel.trim(),
        label: buttonLabel.trim(),
        selected,
        variant
      };
      ++i;
      return button;
    });
  }
}
