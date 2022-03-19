export const SyncTable = {
  name: "SyncTable",
  primaryKey: "id",
  properties: {
    id: "int",
    /**
     * Sync date with box
     */
    lastSyncDate: "date",
  },
}
