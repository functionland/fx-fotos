import { login } from './auth'
const openWeb = () => {
    console.log('other providers clicked');
    login();

}
export const authProviders = [{
    name: 'Other Providers',
    key: 'otherProviders',
    action: openWeb,
    link: ''
}];