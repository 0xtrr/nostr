const { Keys, Client, Filter, loadWasmAsync, Timestamp, Duration, EventSource } = require("../");

async function main() {
    await loadWasmAsync();

    let client = new Client();
    await client.addRelay("wss://relay.damus.io");
    await client.addRelay("wss://nos.lol");
    await client.addRelay("wss://nostr.oxtr.dev");

    await client.connect();

    const keys = Keys.parse("nsec1ufnus6pju578ste3v90xd5m2decpuzpql2295m3sknqcjzyys9ls0qlc85");
    const filter = new Filter().author(keys.publicKey).kind(4).until(Timestamp.now()).limit(10);
    console.log('filter', filter.asJson());

    let source = EventSource.relays(Duration.fromSecs(10));
    let events = await client.getEventsOf([filter], source);
    events.forEach((e) => {
        console.log(e.asJson())
    })
}

main();