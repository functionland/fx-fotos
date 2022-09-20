export type BoxEntity = {
  /**
   * Box peerId
   */
  peerId: string
  /**
   * box nickname.
   */
  name: string | undefined
  /**
   * Box address
   */
  address: string | undefined

  /**
   * Determin the default device for connectio
   */
  isDefault: boolean
}
