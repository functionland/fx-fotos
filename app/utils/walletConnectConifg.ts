import { IProviderMetadata } from '@walletconnect/modal-react-native'

export const WaletConnect_Project_Id = '56755e4e110a783c85b3e6f74beedb2e'
export const providerMetadata: IProviderMetadata = {
  name: 'FxFotos dApp',
  description: 'FxFotos gallery dApp',
  url: 'https://fx.land/',
  icons: ['https://fx.land/favicon-32x32.png'],
  redirect: {
    native: 'fotos://',
  },
}

export const sessionParams = (chainId: number = 1) => ({
  namespaces: {
    eip155: {
      methods: [
        //'eth_sendTransaction',
        //'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        //'eth_signTypedData',
      ],
      //chains: ['eip155:1','eip155:137','eip155:5','eip155:80001'], //['Ethereum Mainnet','polygon','Goerli Testnet','Mumbai Testnet']
      chains: [`eip155:${chainId}`],
      events: ['chainChanged', 'accountsChanged'],
      rpcMap: {},
    },
  },
})
