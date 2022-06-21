/**
 * When an asset stored in the box by encryption we get a fileRef to able to decrypt asset in the future
 */
export type FileRef = {
    /**
     * file cid
     */
    id: string 
    /**
     * 
     */
    iv: string | undefined
    /**
     * 
     */
    key: string | undefined
  }
  