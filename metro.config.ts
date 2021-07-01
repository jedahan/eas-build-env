import { getDefaultConfig } from '@expo/metro-config'

// eslint-disable-next-line no-undef
const defaultConfig = getDefaultConfig(__dirname)

defaultConfig.resolver.assetExts.push(
  'db',
  'mp3',
  'ttf',
  'otf',
  'obj',
  'png',
  'jpg',
  'mtl'
)

export default defaultConfig
