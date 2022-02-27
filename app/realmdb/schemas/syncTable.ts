export const SyncTable = {
  name: "SyncTable",
  primaryKey: "id",
  properties: {
    id: "uuid",
    /**
     * Sync date with box
     */
    lastSyncDate: "date",
  },
}
