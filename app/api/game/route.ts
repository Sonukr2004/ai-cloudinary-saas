import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getBadge(score: number): string {
  if (score >= 100) return "🥇 Gold";
  if (score >= 50) return "🥈 Silver";
  if (score >= 20) return "🥉 Bronze";
  return "🎮 Newbie";
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (userId) {
      const userScore = await prisma.userScore.findUnique({ where: { userId } });
      if (userScore?.lastPlayedAt) {
        const lastPlayed = new Date(userScore.lastPlayedAt);
        const today = new Date();
        const isSameDay =
          lastPlayed.getDate() === today.getDate() &&
          lastPlayed.getMonth() === today.getMonth() &&
          lastPlayed.getFullYear() === today.getFullYear();

        if (isSameDay) {
          const leaderboard = await prisma.userScore.findMany({
            orderBy: { score: "desc" },
            take: 5,
          });
          return NextResponse.json({ alreadyPlayed: true, leaderboard, score: userScore.score, badge: userScore.badge });
        }
      }
    }

    const leaderboard = await prisma.userScore.findMany({
      orderBy: { score: "desc" },
      take: 5,
    });
    return NextResponse.json({ alreadyPlayed: false, leaderboard });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Block if already played today
    const existing = await prisma.userScore.findUnique({ where: { userId } });
    if (existing?.lastPlayedAt) {
      const lastPlayed = new Date(existing.lastPlayedAt);
      const today = new Date();
      const isSameDay =
        lastPlayed.getDate() === today.getDate() &&
        lastPlayed.getMonth() === today.getMonth() &&
        lastPlayed.getFullYear() === today.getFullYear();

      if (isSameDay) {
        return NextResponse.json({ error: "Already played today" }, { status: 403 });
      }
    }

    const { username, score } = await request.json();

    const newTotalScore = (existing?.score || 0) + score;
    const newGamesPlayed = (existing?.gamesPlayed || 0) + 1;
    const badge = getBadge(newTotalScore);

    const userScore = await prisma.userScore.upsert({
      where: { userId },
      update: {
        score: newTotalScore,
        badge,
        gamesPlayed: newGamesPlayed,
        username,
        lastPlayedAt: new Date()
      },
      create: {
        userId,
        username,
        score: newTotalScore,
        badge,
        gamesPlayed: newGamesPlayed,
        lastPlayedAt: new Date()
      },
    });

    return NextResponse.json(userScore);
  } catch (error) {
    console.log("Game score save failed", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}