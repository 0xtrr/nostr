// Copyright (c) 2022-2023 Yuki Kishimoto
// Copyright (c) 2023-2024 Rust Nostr Developers
// Distributed under the MIT software license

use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4};

use nostr_sdk::prelude::*;

const BECH32_SK: &str = "nsec1ufnus6pju578ste3v90xd5m2decpuzpql2295m3sknqcjzyys9ls0qlc85";

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    // Parse keys
    let my_keys = Keys::parse(BECH32_SK)?;

    // Configure client to use proxy for `.onion` relays
    let addr = SocketAddr::V4(SocketAddrV4::new(Ipv4Addr::LOCALHOST, 9050));
    let connection = Connection::new()
        .proxy(addr)
        .target(ConnectionTarget::Onion);
    let opts = Options::new().connection(connection);
    let client = Client::with_opts(&my_keys, opts);

    // Add relays
    client
        .add_relays([
            "wss://relay.damus.io",
            "ws://oxtrdevav64z64yb7x6rjg4ntzqjhedm5b5zjqulugknhzr46ny2qbad.onion",
            "ws://2jsnlhfnelig5acq6iacydmzdbdmg7xwunm4xl6qwbvzacw4lwrjmlyd.onion",
        ])
        .await?;

    // Add relay with custom flags
    let flags = RelayServiceFlags::default().remove(RelayServiceFlags::WRITE); // Use default flags and remove one
    let _flags = RelayServiceFlags::READ | RelayServiceFlags::PING; // Or, explicit set the flags to use
    let opts = RelayOptions::new().flags(flags);
    client.add_relay_with_opts("wss://nostr.mom", opts).await?;

    client.connect().await;

    let subscription = Filter::new().pubkey(my_keys.public_key()).limit(0);

    client.subscribe(vec![subscription], None).await?;

    // Handle subscription notifications with `handle_notifications` method
    client
        .handle_notifications(|notification| async {
            if let RelayPoolNotification::Event { event, .. } = notification {
                if event.kind == Kind::GiftWrap {
                    let UnwrappedGift { rumor, .. } = client.unwrap_gift_wrap(&event).await?;
                    println!("Rumor: {}", rumor.as_json());
                } else {
                    println!("{:?}", event);
                }
            }
            Ok(false) // Set to true to exit from the loop
        })
        .await?;

    // Handle subscription notifications with `notifications` channel receiver
    /* let mut notifications = client.notifications();
    while let Ok(notification) = notifications.recv().await {
        if let RelayPoolNotification::Event { event, .. } = notification {
            if event.kind == Kind::EncryptedDirectMessage {
                if let Ok(msg) = decrypt(&my_keys.secret_key()?, &event.pubkey, &event.content) {
                    println!("New DM: {msg}");
                    client.send_direct_msg(event.pubkey, msg, None).await?;
                } else {
                    tracing::error!("Impossible to decrypt direct message");
                }
            } else {
                println!("{:?}", event);
            }
        }
    } */

    Ok(())
}
