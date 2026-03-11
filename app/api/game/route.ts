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

function isToday(date: Date): boolean {
  const now = new Date();
  const todayUTC = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  const dateUTC = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  return todayUTC === dateUTC;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (userId) {
      const userScore = await prisma.userScore.findUnique({ where: { userId } });
      if (userScore?.lastPlayedAt && isToday(new Date(userScore.lastPlayedAt))) {
        const leaderboard = await prisma.userScore.findMany({
          where: { lastPlayedAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) } },
          orderBy: { dailyScore: "desc" },
          take: 5,
        });
        return NextResponse.json({ alreadyPlayed: true, leaderboard, score: userScore.dailyScore, badge: userScore.badge });
      }
    }

    const leaderboard = await prisma.userScore.findMany({
      where: { lastPlayedAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) } },
      orderBy: { dailyScore: "desc" },
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

    const existing = await prisma.userScore.findUnique({ where: { userId } });

    // Block if already played today
    if (existing?.lastPlayedAt && isToday(new Date(existing.lastPlayedAt))) {
      return NextResponse.json({ error: "Already played today" }, { status: 403 });
    }

    const { username, score } = await request.json();

    const newTotalScore = (existing?.score || 0) + score;
    const newGamesPlayed = (existing?.gamesPlayed || 0) + 1;
    const badge = getBadge(score);

    const userScore = await prisma.userScore.upsert({
      where: { userId },
      update: {
        score: newTotalScore,
        dailyScore: score,
        badge,
        gamesPlayed: newGamesPlayed,
        username,
        lastPlayedAt: new Date(),
        lastResetAt: new Date(),
      },
      create: {
        userId,
        username,
        score: newTotalScore,
        dailyScore: score,
        badge,
        gamesPlayed: newGamesPlayed,
        lastPlayedAt: new Date(),
        lastResetAt: new Date(),
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