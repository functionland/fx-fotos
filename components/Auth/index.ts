import { login } from './Dfinity/auth';

class AuthProvidersClass {
	_identity:any[] = [];
	constructor(identity:any[] = []) {
		if(identity){
			this._identity = identity;
		}
	}

	setIdentity = (identity:any = {}) => {
		if(identity && identity?.success){
			//TODO: Fix this class
			//this._identity.push(identity);
		}
	}
	getIdentity = () => {
		return this._identity;
	}
	private openWeb = async (processLogin:Function) => {
		console.log('Internet Identity clicked');
		let result = await login('https://fx.land/Web-Identity-Providers/?pubKey64=', processLogin);
	}

	authenticate = (processLogout:Function, processLogin:Function) => {
		console.log(this._identity);
		return (
			[
				{
					name: ((this._identity && this._identity[0]?.success)?'Disconnect from ':'Connect with')+'Internet Identity',
					key: 'Internet Identity',
					action: ()=>{
						if(this._identity && this._identity[0]?.success){
							processLogout();
						}else{
							this.openWeb(processLogin);
						}
					},
					link: ''
				}
			]
		);
	}
}
export default AuthProvidersClass;