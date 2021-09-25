import * as FileSystem from 'expo-file-system';
import {Reader} from 'unzipit';
export class StatelessFileReader implements Reader {
	filename: string = '';
	length?: number = undefined;
	constructor(filename: string) {
		this.filename = filename;
	}
	async getLength(): Promise<number> {
		if (this.length === undefined) {
			const stat = await FileSystem.getInfoAsync(this.filename);
			this.length = stat.size;
		}
		console.log('getLength:', this.length);
		return this.length || 0;
	}
	async read(offset: number, length: number) {
		console.log('StatelessFileReader.read:', {offset, length});

		const base64Data = await FileSystem.readAsStringAsync(this.filename, {
			encoding: 'base64',
			position: offset,
			length,
		});
		//const data = new Uint8Array(length);
		const byteArray = new Buffer(
			base64Data.replace(/^[\w\d;:\/]+base64\,/g, ''),
			'base64',
		);
		return byteArray;
	}
}
