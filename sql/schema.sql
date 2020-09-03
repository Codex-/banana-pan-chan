-- Bot --
CREATE TABLE Bot (
  schema_version INTEGER NOT NULL
)

-- Commands --
CREATE TABLE Commands (
  command TEXT NOT NULL PRIMARY KEY,
  role INTEGER NOT NULL,
  body TEXT NOT NULL
)
