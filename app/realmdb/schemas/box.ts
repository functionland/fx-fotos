export const Box = {
  name: 'Box',
  primaryKey: 'peerId',
  properties: {
    /**
     * Box Id
     */
    id: 'string',
    /**
     * Filename of the asset.
     */
    name: 'string',
    /**
     * The connection type which can be direct or based on a relay
     */
    connection: 'string?',
    /**
     * If connection is Direct we can use Blox IP address
     */
    ipAddress: 'string?',
    /**
     * The connection protocol, like TCP
     */
    protocol: 'string',
    /**
     * The Blox port number
     */
    port: 'int',
    /**
     * The Blox peerId
     */
    peerId: 'string',
    /**
     * Determin the default device for connectio
     */
    isDefault: { type: 'bool', default: false },
  },
}
