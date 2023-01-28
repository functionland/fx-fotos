import * as ReactNativeKeychain from 'react-native-keychain'
export { UserCredentials, Result } from 'react-native-keychain'
export enum Service {
  DIDCredentials = 'DIDCredentials',
  FULARootObject = 'FULARootObject',
  FULAPeerIdObject = 'FULAPeerIdObject',
}
/**
 * Saves some credentials securely.
 *
 * @param username The username
 * @param password The password
 * @param service The service these creds are for.
 */
export async function save(
  username: string,
  password: string,
  service?: Service | undefined,
): Promise<false | ReactNativeKeychain.UserCredentials> {
  if (
    await ReactNativeKeychain.setGenericPassword(username, password, {
      service,
    })
  ) {
    return {
      username,
      password,
      service,
    }
  } else return false
}

/**
 * Loads credentials that were already saved.
 *
 * @param service The service that these creds are for
 */
export async function load(
  service?: Service | undefined,
): Promise<false | ReactNativeKeychain.UserCredentials> {
  return await ReactNativeKeychain.getGenericPassword({ service })
}

/**
 * Resets any existing credentials for the given server.
 *
 * @param service The service which has these creds
 */
export async function reset(service?: Service | undefined): Promise<boolean> {
  return await ReactNativeKeychain.resetGenericPassword({ service })
}
