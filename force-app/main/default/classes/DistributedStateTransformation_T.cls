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

@IsTest
public with sharing class DistributedStateTransformation_T {
  @TestSetup
  static void createTestRecords() {
    DistributedStateTransformation__c accountChildTableTransformation = new DistributedStateTransformation__c(
      Name = 'AccountChildDataTable'
    );
    insert (accountChildTableTransformation);
    List<PropertyTransformation__c> propertyTransformations = new List<PropertyTransformation__c>();
    PropertyTransformation__c opportunityDataTableFields = new PropertyTransformation__c(
      DistributedStateTransformation__c = accountChildTableTransformation.Id,
      Name = 'OpportunityDataTableTransformation',
      SourcePropertyName__c = 'accountChildSObjectName',
      SourceValue__c = 'Opportunity',
      TargetPropertyName__c = 'accountChildDataTableFields',
      TargetValue__c = 'Name,StageName,Amount,CloseDate',
      IsDynamic__c = false
    );
    propertyTransformations.add(opportunityDataTableFields);
    PropertyTransformation__c caseDataTableFields = new PropertyTransformation__c(
      DistributedStateTransformation__c = accountChildTableTransformation.Id,
      Name = 'OpportunityDataTableTransformation',
      SourcePropertyName__c = 'accountChildSObjectName',
      SourceValue__c = 'Case',
      TargetPropertyName__c = 'accountChildDataTableFields',
      TargetValue__c = 'Subject,Type,CaseReasong,Status,Origin,Priority,Contact',
      IsDynamic__c = false
    );
    propertyTransformations.add(caseDataTableFields);
    insert (propertyTransformations);
  }

  @IsTest
  static void givenDistributedStateTransformationWhenRequestingThenItIsReturned() {
    //Given
    //When
    Test.startTest();
    List<PropertyTransformation__c> propertyTransformations = DistributedStateTransformation.getPropertyTransformationsByName(
      'AccountChildDataTable'
    );
    Test.stopTest();
    //Then
    System.assertEquals(2, propertyTransformations.size());
  }
}
