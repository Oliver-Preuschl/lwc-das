/*
 * Author: oliver.preuschl (H+W Consult GmbH)
 */

public with sharing class DistributedStateTransformation {
  @AuraEnabled
  public static List<PropertyTransformation__c> getTransformationByName(
    String name
  ) {
    try {
      List<PropertyTransformation__c> propertyTransformations = [
        SELECT
          Id,
          SourcePropertyName__c,
          TargetPropertyName__c,
          SourceValue__c,
          TargetValue__c
        FROM PropertyTransformation__c
        WHERE DistributedStateTransformation__r.Name = :name
      ];
      return propertyTransformations;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
