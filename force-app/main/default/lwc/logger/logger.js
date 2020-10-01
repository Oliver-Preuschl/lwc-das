/**
 * @author  : Oliver Preuschl (H+W Consult GmbH)
 * Modifications Log
 * Ver   Date         Author                               Modification
 * 1.0   09-23-2020   Oliver Preuschl (H+W Consult GmbH)   Initial Version
 **/
export default class Logger {
  static startGroup(title, message) {
    console.group(
      `%c[${title}] [${message}]%c`,
      "font-weight: bold;",
      "font-weight: normal;"
    );
  }

  static startErrorGroup(title, message) {
    console.group(
      `%c[${title}] [${message}]%c`,
      "font-weight: bold; color: red;",
      "font-weight: normal; color: white;"
    );
  }

  static logMessage(title, message) {
    console.log(
      `%c[${title}]%c ${message}`,
      "font-weight: bold;",
      "font-weight: normal;"
    );
  }

  static logError(title, message) {
    console.log(
      `%c[${title}]%c ${message}`,
      "font-weight: bold; color: red;",
      "font-weight: normal; color: white;"
    );
  }

  static endGroup() {
    console.groupEnd();
  }
}
