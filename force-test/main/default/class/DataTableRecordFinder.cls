/*
 * Author: oliver.preuschl (H+W Consult GmbH)
 */

public with sharing class DataTableRecordFinder {
  @AuraEnabled
  public static List<SObject> getRecords(
    String sObjectName,
    String fields,
    String criteria,
    String recordLimit
  ) {
    String query = 'SELECT ' + fields + ' FROM ' + sObjectName;
    if (String.isNotBlank(criteria)) {
      query += ' WHERE ' + criteria;
    }
    if (String.isNotBlank(recordLimit)) {
      query += ' LIMIT ' + recordLimit;
    }
    System.debug(query);
    return Database.query(query);
  }

  /*private static void getFieldTypes(String sObjectName, String fields){
    Map<String, SObjectField> fieldName2Field = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();

  }*/
}
