import { createHash } from "node:crypto";

interface SeatmapClient {
  socket: any;
  eventId: string;
}

function buildAcceptKey(key: string) {
  return createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
}

function encodeFrame(message: string): any {
  const payload = Buffer.from(message);
  const length = payload.length;

  if (length < 126) {
    const frame = Buffer.alloc(2 + length);
    frame[0] = 0x81; // FIN + text frame
    frame[1] = length;
    payload.copy(frame, 2);
    return frame;
  }

  if (length < 65536) {
    const frame = Buffer.alloc(4 + length);
    frame[0] = 0x81;
    frame[1] = 126;
    frame.writeUInt16BE(length, 2);
    payload.copy(frame, 4);
    return frame;
  }

  const frame = Buffer.alloc(10 + length);
  frame[0] = 0x81;
  frame[1] = 127;
  frame.writeBigUInt64BE(BigInt(length), 2);
  payload.copy(frame, 10);
  return frame;
}

export function createSeatmapWSServer(server: any) {
  const clients = new Set<SeatmapClient>();

  function removeClient(client: SeatmapClient) {
    if (clients.has(client)) {
      try {
        client.socket.destroy();
      } catch {
        // ignore
      }
      clients.delete(client);
    }
  }

  server.on("upgrade", (req: any, socket: any) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const match = url.pathname.match(/^\/ws\/events\/([^/]+)\/seatmap$/);
    const keyHeader = req.headers?.["sec-websocket-key"];
    const secKey = Array.isArray(keyHeader) ? keyHeader[0] : keyHeader;

    if (!match || !secKey) {
      socket.write("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    const acceptKey = buildAcceptKey(secKey);
    const responseHeaders = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "\r\n",
    ];

    socket.write(responseHeaders.join("\r\n"));

    const client: SeatmapClient = { socket, eventId: decodeURIComponent(match[1]) };
    clients.add(client);

    socket.on("data", (buffer: any) => {
      const opcode = buffer[0] & 0x0f;
      if (opcode === 0x8) {
        removeClient(client);
      }
    });

    socket.on("close", () => removeClient(client));
    socket.on("end", () => removeClient(client));
    socket.on("error", () => removeClient(client));

    try {
      socket.write(encodeFrame(JSON.stringify({ type: "connected", eventId: client.eventId })));
    } catch (err) {
      console.error("ws welcome send failed", err);
    }
  });

  function broadcastSeatChange(eventId: string, seatId: string, status: string) {
    const frame = encodeFrame(
      JSON.stringify({ type: "seatStatusChanged", eventId, seatId, status }),
    );
    clients.forEach((client) => {
      if (client.eventId === eventId) {
        try {
          client.socket.write(frame);
        } catch (err) {
          console.error("ws broadcast failed", err);
        }
      }
    });
  }

  return { broadcastSeatChange };
}
