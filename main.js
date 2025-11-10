// export function add(a: number, b: number): number {
//   return a + b;
// }

// // Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// if (import.meta.main) {
//   console.log("Add 2 + 3 =", add(2, 3));
// }

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import dadJokes from "@mikemcbride/dad-jokes";
import express from "express";
import { z } from "zod";

const parents = ["אליעזר", "רבקי"];
const children = ["טובי", "דודי", "רחלי", "מאיר", "ליבי"];
const address = "פנחס לוין 27, עמנואל";

// מקבל מערך ומחזיר איבר אקראי
// function randomChoice(arr) {
//   if (arr.length === 0) return undefined; // טיפול במערך ריק
//   const idx = Math.floor(Math.random() * arr.length); // יוצר אינדקס אקראי ב-[0, arr.length-1]
//   return arr[idx];
// }

const server = new McpServer({
  name: "My MCP Server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.registerTool(
  "give-me-the-demo-parents",
  {
    // inputSchema: {
    //   id: z
    //     .number()
    //     .min(0)
    //     .max(dadJokes.all.length - 1)
    //     .describe("joke id"),
    // },
    title: "Give me the names of the demo parents.",
    description: `Give me the names of the demo parents.`,
  },
  () => {
    // const joke = { joke: dadJokes.all[id] };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ parents }),
        },
      ],
      structuredContent: { parents },
    };
  }
);

server.registerTool(
  "give-demo-children's-list",
  {
    title: "Giving demo children's list",
    description: "Giving demo children's list",
  },
  () => {
    // const child = { child: randomChoice(children) };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ children }),
        },
      ],
      structuredContent: { children },
    };
  }
);

server.registerTool(
  "give-me-my-demo-address",
  {
    title: "Returns my demo residential address",
    description: "Returns my demo residential address",
  },
  () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ address }),
        },
      ],
      structuredContent: { address },
    };
  }
);

// Streamable HTTP Server
const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  // Create a new transport for each request to prevent request ID collisions
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || "3000");
app
  .listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });

// STDIO Server
// const transport = new StdioServerTransport();
// await server.connect(transport);
