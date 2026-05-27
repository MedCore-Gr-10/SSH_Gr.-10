import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

client.on("error", (err) => console.log(err));

await client.connect();

console.log("Connected");

await client.set("medcore", "working");

const result = await client.get("medcore");

console.log(result);

process.exit();