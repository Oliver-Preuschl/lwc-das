/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-20-2020   Oliver Preuschl                      Initial Version
 **/

//LWC
import { LightningElement, api, track } from "lwc";
import { DistributedApplicationStateMixin } from "c/distributedApplicationState";

export default class DeclarativeButtonGroup extends DistributedApplicationStateMixin(
  LightningElement
) {
  //Public Properties-------------------------------------------------------------------------
  @api
  get buttonLabels() {
    return this._buttonLabels;
  }

  set buttonLabels(value) {
    this._buttonLabels = value;
    this.calculateButtons();
  }

  @api
  get selectedButtonLabel() {
    return this._selectedButtonLabel;
  }

  set selectedButtonLabel(value) {
    this._selectedButtonLabel = value;
    this.getButtonDataForLabel(value);
  }

  @api selectedNamePropertyName;

  //Tracked Properties
  @track buttons = [];

  //Private Properties------------------------------------------------------------------------
  isRendered = false;
  _buttonLabels;
  _selectedButtonLabel;
  selectedButtonIndex;

  //Lifecycle Hooks - (constructor, connectedCallback, disconnectedCallback, render, renderedCallback, errorCallback)
  connectedCallback() {
    this.startStateHandling({
      dynamicProperties: [{ name: "buttonLabels" }]
    });
  }

  disconnectedCallback() {
    this.stopStateHandling();
  }

  renderedCallback() {
    if (this.isRendered) {
      return;
    }
    this.isRendered = true;
    const buttonToSelect = this.getButtonDataForLabel(this.selectedButtonLabel);
    if (buttonToSelect) {
      this.selectButton({
        buttonIndex: buttonToSelect.dataset.index,
        buttonLabel: buttonToSelect.name
      });
    }
  }

  //Handlers----------------------------------------------------------------------------------
  handleButtonClick(event) {
    this.selectButton({
      buttonIndex: event.target.dataset.index,
      buttonLabel: event.target.name
    });
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

  selectButton({ buttonIndex, buttonLabel }) {
    if (buttonIndex === this.selectedButtonIndex) {
      return;
    }
    if (
      this.selectedButtonIndex !== null &&
      this.selectedButtonIndex !== undefined
    ) {
      this.buttons[this.selectedButtonIndex].selected = false;
      this.buttons[this.selectedButtonIndex].variant = "neutral";
    }
    this.selectedButtonIndex = buttonIndex;
    this.buttons[this.selectedButtonIndex].selected = true;
    this.buttons[this.selectedButtonIndex].variant = "brand";
    if (this.selectedNamePropertyName) {
      this.publishStateChange(this.selectedNamePropertyName, buttonLabel);
    }
  }

  getButtonDataForLabel(label) {
    const buttons = this.template.querySelectorAll("lightning-button");
    let buttonToReturn = null;
    buttons.forEach((button) => {
      if (button.name === label) {
        buttonToReturn = button;
      }
    });
    return buttonToReturn;
  }
}
