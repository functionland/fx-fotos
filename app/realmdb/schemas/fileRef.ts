/**
 * When an asset stored in the box by encryption we get a fileRef to able to decrypt asset in the future
 */
export const FileRefSchema = {
  name: "FileRef",
  embedded: true, // default: false
  properties: {
    id: "string",
    iv: "string",
    key: "string",
  },
}
