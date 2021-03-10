CREATE EXTERNAL TABLE IF NOT EXISTS qs_meta_table
( `DashboardName` string, 
 `DatasetName` string, 
 `Status` string, 
 `LastRefershTime` string, 
 `DataSourceName` string ) 
 ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde' WITH SERDEPROPERTIES 
 ( "separatorChar" = "," )
 LOCATION 's3://bucketname/quicksight-dashboard-metada/' 
 TBLPROPERTIES ( "skip.header.line.count"="1")
 