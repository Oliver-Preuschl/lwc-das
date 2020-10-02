import Logger from "c/logger";

describe("Logger", () => {
  const originalLog = console.log;
  let consoleOutput;
  const mockedLog = (...args) => consoleOutput.push(...args);
  afterEach(() => {
    console.group = originalLog;
    console.log = originalLog;
    console.groupEnd = originalLog;
  });
  beforeEach(() => {
    consoleOutput = [];
    console.group = mockedLog;
    console.log = mockedLog;
    console.groupEnd = mockedLog;
  });
  it("should start logging group", () => {
    Logger.startGroup("startGroup", "message");
    expect(consoleOutput).toMatchObject([
      "%c[startGroup] [message]%c",
      "font-weight: bold;",
      "font-weight: normal;"
    ]);
  });

  it("should start error logging group", () => {
    Logger.startErrorGroup("startGroup", "message");
    expect(consoleOutput).toMatchObject([
      "%c[startGroup] [message]%c",
      "font-weight: bold; color: red;",
      "font-weight: normal; color: white;"
    ]);
  });

  it("should log message", () => {
    Logger.logMessage("logMessage", "message");
    expect(consoleOutput).toMatchObject([
      "%c[logMessage]%c message",
      "font-weight: bold;",
      "font-weight: normal;"
    ]);
  });

  it("should log error message", () => {
    Logger.logError("logMessage", "message");
    expect(consoleOutput).toMatchObject([
      "%c[logMessage]%c message",
      "font-weight: bold; color: red;",
      "font-weight: normal; color: white;"
    ]);
  });

  it("should end logging group", () => {
    Logger.endGroup();
    expect(consoleOutput).toMatchObject([]);
  });
});
