export const FolderSettings = {
  name: 'FolderSettings',
  primaryKey: 'name',
  properties: {
    /**
     * folder name
     */
    name: 'string',
    /**
     * Determine auto backup folder's content
     */
    autoBackup: { type: 'bool', default: false },
  },
}
