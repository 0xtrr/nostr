const { existsSync, readFileSync } = require('fs')
const { join } = require('path')

const { platform, arch } = process

let nativeBinding = null
let localFileExisted = false
let loadError = null

function isMusl() {
  // For Node 10
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      const lddPath = require('child_process').execSync('which ldd').toString().trim();
      return readFileSync(lddPath, 'utf8').includes('musl')
    } catch (e) {
      return true
    }
  } else {
    const { glibcVersionRuntime } = process.report.getReport().header
    return !glibcVersionRuntime
  }
}

switch (platform) {
  case 'android':
    switch (arch) {
      case 'arm64':
        localFileExisted = existsSync(join(__dirname, 'nostr-sdk.android-arm64.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.android-arm64.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-android-arm64')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm':
        localFileExisted = existsSync(join(__dirname, 'nostr-sdk.android-arm-eabi.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.android-arm-eabi.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-android-arm-eabi')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Android ${arch}`)
    }
    break
  case 'win32':
    switch (arch) {
      case 'x64':
        localFileExisted = existsSync(
          join(__dirname, 'nostr-sdk.win32-x64-msvc.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.win32-x64-msvc.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-win32-x64-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'ia32':
        localFileExisted = existsSync(
          join(__dirname, 'nostr-sdk.win32-ia32-msvc.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.win32-ia32-msvc.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-win32-ia32-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        localFileExisted = existsSync(
          join(__dirname, 'nostr-sdk.win32-arm64-msvc.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.win32-arm64-msvc.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-win32-arm64-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Windows: ${arch}`)
    }
    break
  case 'darwin':
    localFileExisted = existsSync(join(__dirname, 'nostr-sdk.darwin-universal.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./nostr-sdk.darwin-universal.node')
      } else {
        nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-darwin-universal')
      }
      break
    } catch {}
    switch (arch) {
      case 'x64':
        localFileExisted = existsSync(join(__dirname, 'nostr-sdk.darwin-x64.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.darwin-x64.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-darwin-x64')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        localFileExisted = existsSync(
          join(__dirname, 'nostr-sdk.darwin-arm64.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.darwin-arm64.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-darwin-arm64')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on macOS: ${arch}`)
    }
    break
  case 'freebsd':
    if (arch !== 'x64') {
      throw new Error(`Unsupported architecture on FreeBSD: ${arch}`)
    }
    localFileExisted = existsSync(join(__dirname, 'nostr-sdk.freebsd-x64.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./nostr-sdk.freebsd-x64.node')
      } else {
        nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-freebsd-x64')
      }
    } catch (e) {
      loadError = e
    }
    break
  case 'linux':
    switch (arch) {
      case 'x64':
        if (isMusl()) {
          localFileExisted = existsSync(
            join(__dirname, 'nostr-sdk.linux-x64-musl.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./nostr-sdk.linux-x64-musl.node')
            } else {
              nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-linux-x64-musl')
            }
          } catch (e) {
            loadError = e
          }
        } else {
          localFileExisted = existsSync(
            join(__dirname, 'nostr-sdk.linux-x64-gnu.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./nostr-sdk.linux-x64-gnu.node')
            } else {
              nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-linux-x64-gnu')
            }
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm64':
        if (isMusl()) {
          localFileExisted = existsSync(
            join(__dirname, 'nostr-sdk.linux-arm64-musl.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./nostr-sdk.linux-arm64-musl.node')
            } else {
              nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-linux-arm64-musl')
            }
          } catch (e) {
            loadError = e
          }
        } else {
          localFileExisted = existsSync(
            join(__dirname, 'nostr-sdk.linux-arm64-gnu.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./nostr-sdk.linux-arm64-gnu.node')
            } else {
              nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-linux-arm64-gnu')
            }
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm':
        localFileExisted = existsSync(
          join(__dirname, 'nostr-sdk.linux-arm-gnueabihf.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./nostr-sdk.linux-arm-gnueabihf.node')
          } else {
            nativeBinding = require('@rust-nostr/nostr-sdk-nodejs-linux-arm-gnueabihf')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Linux: ${arch}`)
    }
    break
  default:
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`)
}

if (!nativeBinding) {
  if (loadError) {
    throw loadError
  }
  throw new Error(`Failed to load native binding`)
}

const { EventBuilder, EventId, Event, PublicKey, SecretKey, Keys, SubscriptionId, Filter, encrypt, decrypt, verifyNip05, RelayInformationDocument, createDelegationTag, validateDelegationTag, signDelegation, verifyDelegationSignature, ChannelId, Contact, Metadata, Options, Client, Relay, JsRelayStatus, initLogger } = nativeBinding

module.exports.EventBuilder = EventBuilder
module.exports.EventId = EventId
module.exports.Event = Event
module.exports.PublicKey = PublicKey
module.exports.SecretKey = SecretKey
module.exports.Keys = Keys
module.exports.SubscriptionId = SubscriptionId
module.exports.Filter = Filter
module.exports.encrypt = encrypt
module.exports.decrypt = decrypt
module.exports.verifyNip05 = verifyNip05
module.exports.RelayInformationDocument = RelayInformationDocument
module.exports.createDelegationTag = createDelegationTag
module.exports.validateDelegationTag = validateDelegationTag
module.exports.signDelegation = signDelegation
module.exports.verifyDelegationSignature = verifyDelegationSignature
module.exports.ChannelId = ChannelId
module.exports.Contact = Contact
module.exports.Metadata = Metadata
module.exports.Options = Options
module.exports.Client = Client
module.exports.Relay = Relay
module.exports.JsRelayStatus = JsRelayStatus
module.exports.initLogger = initLogger
