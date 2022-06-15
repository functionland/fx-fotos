export const translateOrigin = (center: number, d: number) => {
  return center - d / 2
}
export const convertDurationToTime = (duration: number): string => {
  const h = Math.floor(duration / 3600)
  const m = Math.floor((duration % 3600) / 60)
  const s = Math.floor(duration % 60)
  return h
    ? `${h.toString().padStart(2, "0")}:`
    : "" + `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export const getWalletImage = (walletName: string) => {
  switch (walletName) {
    case "MetaMask":
      return require("../../assets/images/wallets/MetaMask.png")
    default:
      return null
  }
}
