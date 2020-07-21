-- Bot --
CREATE TABLE Bot (
  schema_version INTEGER NOT NULL
)

-- Commands --
CREATE TABLE Commands (
  command TEXT NOT NULL PRIMARY KEY,
  role TEXT NOT NULL,
  body TEXT NOT NULL
)
