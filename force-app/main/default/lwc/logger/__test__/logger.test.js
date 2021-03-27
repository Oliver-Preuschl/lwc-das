/*
 * Copyright 2021 Oliver Preuschl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
