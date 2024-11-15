// Copyright (c) 2022-2023 Yuki Kishimoto
// Copyright (c) 2023-2024 Rust Nostr Developers
// Distributed under the MIT software license

use std::ops::Deref;
use std::sync::Arc;

use nostr::nips::nip06::FromMnemonic;
use nostr::secp256k1::Message;
use nostr::{key, NostrSigner as _};
use uniffi::Object;

mod public_key;
mod secret_key;

pub use self::public_key::PublicKey;
pub use self::secret_key::SecretKey;
use super::signer::{NostrSigner, SignerBackend};
use crate::error::Result;
use crate::protocol::{Event, UnsignedEvent};

/// Nostr keys
#[derive(Debug, PartialEq, Eq, Object)]
#[uniffi::export(Debug, Eq)]
pub struct Keys {
    inner: key::Keys,
}

impl Deref for Keys {
    type Target = key::Keys;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl From<key::Keys> for Keys {
    fn from(inner: key::Keys) -> Self {
        Self { inner }
    }
}

#[uniffi::export]
impl Keys {
    /// Initialize nostr keys from secret key.
    #[uniffi::constructor]
    pub fn new(secret_key: &SecretKey) -> Self {
        Self {
            inner: key::Keys::new(secret_key.deref().clone()),
        }
    }

    /// Parse secret key from `hex` or `bech32` and compose keys
    #[uniffi::constructor]
    pub fn parse(secret_key: &str) -> Result<Self> {
        Ok(Self {
            inner: key::Keys::parse(secret_key)?,
        })
    }

    /// Generate random keys
    ///
    /// This constructor use a random number generator that retrieves randomness from the operating system.
    ///
    /// Generate random keys **without** construct the `Keypair`.
    /// This allows faster keys generation (i.e. for vanity pubkey mining).
    /// The `Keypair` will be automatically created when needed and stored in a cell.
    #[uniffi::constructor]
    pub fn generate() -> Self {
        Self {
            inner: key::Keys::generate(),
        }
    }

    #[uniffi::constructor]
    pub fn vanity(prefixes: Vec<String>, bech32: bool, num_cores: u8) -> Result<Self> {
        Ok(Self {
            inner: key::Keys::vanity(prefixes, bech32, num_cores as usize)?,
        })
    }

    /// Derive keys from BIP-39 mnemonics (ENGLISH wordlist).
    ///
    /// <https://github.com/nostr-protocol/nips/blob/master/06.md>
    #[uniffi::constructor(default(passphrase = None, account = None, typ = None, index = None))]
    pub fn from_mnemonic(
        mnemonic: String,
        passphrase: Option<String>,
        account: Option<u32>,
        typ: Option<u32>,
        index: Option<u32>,
    ) -> Result<Self> {
        Ok(Self {
            inner: key::Keys::from_mnemonic_advanced(mnemonic, passphrase, account, typ, index)?,
        })
    }

    /// Get public key
    pub fn public_key(&self) -> PublicKey {
        self.inner.public_key().into()
    }

    /// Get secret key
    pub fn secret_key(&self) -> SecretKey {
        self.inner.secret_key().clone().into()
    }

    /// Creates a schnorr signature of a message.
    ///
    /// This method use a random number generator that retrieves randomness from the operating system.
    pub fn sign_schnorr(&self, message: &[u8]) -> Result<String> {
        let message: Message = Message::from_digest_slice(message)?;
        Ok(self.inner.sign_schnorr(&message).to_string())
    }
}

#[uniffi::export]
#[async_trait::async_trait]
impl NostrSigner for Keys {
    fn backend(&self) -> SignerBackend {
        self.inner.backend().into()
    }

    async fn get_public_key(&self) -> Result<Option<Arc<PublicKey>>> {
        Ok(Some(Arc::new(self.inner.get_public_key().await?.into())))
    }

    async fn sign_event(&self, unsigned: Arc<UnsignedEvent>) -> Result<Option<Arc<Event>>> {
        Ok(Some(Arc::new(
            self.inner
                .sign_event(unsigned.as_ref().deref().clone())
                .await?
                .into(),
        )))
    }

    async fn nip04_encrypt(&self, public_key: Arc<PublicKey>, content: String) -> Result<String> {
        Ok(self
            .inner
            .nip04_encrypt(public_key.as_ref().deref(), &content)
            .await?)
    }

    async fn nip04_decrypt(
        &self,
        public_key: Arc<PublicKey>,
        encrypted_content: String,
    ) -> Result<String> {
        Ok(self
            .inner
            .nip04_decrypt(public_key.as_ref().deref(), &encrypted_content)
            .await?)
    }

    async fn nip44_encrypt(&self, public_key: Arc<PublicKey>, content: String) -> Result<String> {
        Ok(self
            .inner
            .nip44_encrypt(public_key.as_ref().deref(), &content)
            .await?)
    }

    async fn nip44_decrypt(&self, public_key: Arc<PublicKey>, payload: String) -> Result<String> {
        Ok(self
            .inner
            .nip44_decrypt(public_key.as_ref().deref(), &payload)
            .await?)
    }
}
