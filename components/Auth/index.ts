import { login } from './Dfinity/auth'
const dfinity = () => {

    console.log('dfinity clicked');
    login();

}
export const authProviders = [{
    name: 'Internet Identity',
    key: 'dfinity',
    action: dfinity,
}];