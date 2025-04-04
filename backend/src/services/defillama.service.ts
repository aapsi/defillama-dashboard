import { PrismaClient } from "@prisma/client";
import Sentiment from "sentiment";
import axios from "axios";

const prisma = new PrismaClient();
const sentimentAnalyzer = new Sentiment();

interface DefiLlamaProtocol {
  id: string;
  name: string;
  symbol: string;
  chain: string[];
  category: string;
  tvl: number;
  mcap: number;
  volume24h: number;
  change_1h: number;
  change_1d: number;
  change_7d: number;
}

export class DefiLlamaService {
  private baseUrl = "https://api.llama.fi";

  async fetchAndStoreProtocols() {
    try {
      const response = await axios.get(`${this.baseUrl}/protocols`);
      const protocols = response.data;

      for (const protocol of protocols) {
        // Calculate simple sentiment based on name and description
        const sentimentScore = sentimentAnalyzer.analyze(
          protocol.name + " " + (protocol.description || "")
        ).score;
        const normalizedSentiment = Math.max(
          -1,
          Math.min(1, sentimentScore / 5)
        ); // Normalize to [-1, 1]

        // Update or create protocol
        await prisma.protocol.upsert({
          where: { id: protocol.id },
          update: {
            name: protocol.name,
            symbol: protocol.symbol || null,
            chain: protocol.chain?.[0] || null,
            category: protocol.category,
            tvlUsd: protocol.tvl,
            mcap: protocol.mcap || null,
            volume24h: protocol.volume24h || null,
            change_1h: protocol.change_1h || null,
            change_1d: protocol.change_1d || null,
            change_7d: protocol.change_7d || null,
            lastUpdated: new Date(),
          },
          create: {
            id: protocol.id,
            name: protocol.name,
            symbol: protocol.symbol || null,
            chain: protocol.chain?.[0] || null,
            category: protocol.category,
            tvlUsd: protocol.tvl,
            mcap: protocol.mcap || null,
            volume24h: protocol.volume24h || null,
            change_1h: protocol.change_1h || null,
            change_1d: protocol.change_1d || null,
            change_7d: protocol.change_7d || null,
          },
        });

        // Store historical data point
        await prisma.protocolHistory.create({
          data: {
            protocolId: protocol.id,
            tvlUsd: protocol.tvl,
            mcap: protocol.mcap || null,
            volume24h: protocol.volume24h || null,
            timestamp: new Date(),
            sentiment: normalizedSentiment,
          },
        });
      }

      return { success: true, count: protocols.length };
    } catch (error) {
      console.error("Error fetching protocols:", error);
      throw error;
    }
  }

  async getProtocolHistory(protocolId: string, days: number = 7) {
    const history = await prisma.protocolHistory.findMany({
      where: {
        protocolId,
        timestamp: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });
    return history;
  }

  async searchProtocols(query: string, category?: string) {
    return prisma.protocol.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { symbol: { contains: query, mode: "insensitive" } },
        ],
        ...(category && { category }),
      },
      take: 20,
    });
  }
}
