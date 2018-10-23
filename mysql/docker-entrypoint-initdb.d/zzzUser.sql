REVOKE ALL PRIVILEGES ON qsdb.* FROM 'qsdb_user'@'%';
FLUSH PRIVILEGES;
GRANT SELECT ON qsdb.* TO 'qsdb_user'@'%';
GRANT INSERT ON qsdb.* TO 'qsdb_user'@'%';
GRANT UPDATE ON qsdb.* TO 'qsdb_user'@'%';
GRANT DELETE ON qsdb.* TO 'qsdb_user'@'%';
GRANT FILE ON *.* TO 'qsdb_user'@'%';
FLUSH PRIVILEGES;

