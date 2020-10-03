/**
 * @author  : Oliver Preuschl
 * Modifications Log
 * Ver   Date         Author            Modification
 * 1.0   10-03-2020   Oliver Preuschl   Initial Version
 **/
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
