export type BoxEntity = {
  /**
   * Box Id
   */
  id: string
  /**
   * Filename of the asset.
   */
  name: string
  /**
   * The connection type which can be direct or based on a relay
   */
  connection?: string | undefined
  /**
   * If connection is Direct we can use Blox IP address
   */
  ipAddress?: string | undefined
  /**
   * The connection protocol, like TCP
   */
  protocol: string
  /**
   * The Blox port number
   */
  port: number
  /**
   * The Blox peerId
   */
  peerId: string
  /**
   * Determin the default device for connectio
   */
  isDefault: boolean
}
