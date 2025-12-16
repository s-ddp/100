import amqp from "../../legacy/shims/amqplib.js";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const QUEUE_NEW_ORDERS = "orders.new";

let channelPromise: Promise<any> | null = null;

async function getChannel(): Promise<any> {
  if (!channelPromise) {
    channelPromise = (async () => {
      const conn = await amqp.connect(RABBITMQ_URL);
      const ch = await conn.createChannel();
      await ch.assertQueue(QUEUE_NEW_ORDERS, { durable: true });
      console.log("RabbitMQ connected, queue:", QUEUE_NEW_ORDERS);
      return ch;
    })();
  }
  return channelPromise;
}

export async function publishNewOrderMessage(payload: any) {
  try {
    const ch = await getChannel();
    ch.sendToQueue(QUEUE_NEW_ORDERS, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  } catch (e) {
    console.error("RabbitMQ publishNewOrderMessage error", e);
  }
}
