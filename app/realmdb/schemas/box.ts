export const Box = {
  name: "Box",
  primaryKey: "peerId",
  properties: {
    /**
     * Box peerId
     */
    peerId: "string",
    /**
     * Filename of the asset.
     */
    name: "string?",
    /**
     * URI that points to the asset. `assets://*` (iOS), `file://*` (Android)
     */
    address: "string?",
    /**
     * Determin the default device for connectio
     */
    isDefault: { type: "bool", default: false },
  },
}
