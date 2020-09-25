/*
 * Author: oliver.preuschl
 */

public with sharing class RecordFinder {
  @AuraEnabled
  public static List<SObject> getRecords(
    String sObjectApiName,
    String fields,
    String criteria,
    String recordLimit
  ) {
    try {
      String query = 'SELECT ' + fields + ' FROM ' + sObjectApiName;
      if (String.isNotBlank(criteria)) {
        query += ' WHERE ' + criteria;
      }
      if (String.isNotBlank(recordLimit)) {
        query += ' LIMIT ' + recordLimit;
      }
      System.debug(query);
      return Database.query(query);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /*private static void getFieldTypes(String sObjectName, String fields){
    Map<String, SObjectField> fieldName2Field = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();

  }*/
}
