USE appdb;
GO

IF OBJECT_ID('dbo.AuditLog') IS NULL
BEGIN
  CREATE TABLE dbo.AuditLog (
    Id        BIGINT IDENTITY(1,1) PRIMARY KEY,
    TableName NVARCHAR(128) NOT NULL,
    Action    NVARCHAR(10)  NOT NULL,           -- INSERT / UPDATE / DELETE
    RowData   NVARCHAR(MAX) NULL,               -- JSON
    ChangedAt DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    ChangedBy NVARCHAR(128) NULL
  );

  CREATE INDEX IX_AuditLog_TableName_ChangedAt ON dbo.AuditLog(TableName, ChangedAt DESC);
END
GO

-- ==== Triggers pe Products ====
IF OBJECT_ID('dbo.trg_Products_Audit_Ins') IS NOT NULL DROP TRIGGER dbo.trg_Products_Audit_Ins;
IF OBJECT_ID('dbo.trg_Products_Audit_Upd') IS NOT NULL DROP TRIGGER dbo.trg_Products_Audit_Upd;
IF OBJECT_ID('dbo.trg_Products_Audit_Del') IS NOT NULL DROP TRIGGER dbo.trg_Products_Audit_Del;
GO

CREATE TRIGGER dbo.trg_Products_Audit_Ins ON dbo.Products
AFTER INSERT AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.AuditLog(TableName, Action, RowData, ChangedBy)
  SELECT 'Products','INSERT', (SELECT * FROM inserted FOR JSON AUTO), SUSER_SNAME();
END
GO

CREATE TRIGGER dbo.trg_Products_Audit_Upd ON dbo.Products
AFTER UPDATE AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @old NVARCHAR(MAX) = (SELECT * FROM deleted FOR JSON AUTO);
  DECLARE @new NVARCHAR(MAX) = (SELECT * FROM inserted FOR JSON AUTO);
  INSERT INTO dbo.AuditLog(TableName, Action, RowData, ChangedBy)
  VALUES ('Products','UPDATE', JSON_QUERY(CONCAT('{ "old":', @old, ', "new":', @new, ' }')), SUSER_SNAME());
END
GO

CREATE TRIGGER dbo.trg_Products_Audit_Del ON dbo.Products
AFTER DELETE AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.AuditLog(TableName, Action, RowData, ChangedBy)
  SELECT 'Products','DELETE', (SELECT * FROM deleted FOR JSON AUTO), SUSER_SNAME();
END
GO
