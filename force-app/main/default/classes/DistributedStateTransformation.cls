/*
 * Author: oliver.preuschl
 */

public with sharing class DistributedStateTransformation {
  @AuraEnabled(cacheable=true)
  public static List<PropertyTransformation__c> getPropertyTransformationsByName(
    String name
  ) {
    return [
      SELECT
        Id,
        SourcePropertyName__c,
        TargetPropertyName__c,
        SourceValue__c,
        TargetValue__c,
        IsDynamic__c
      FROM PropertyTransformation__c
      WHERE DistributedStateTransformation__r.Name = :name
    ];
  }
}
