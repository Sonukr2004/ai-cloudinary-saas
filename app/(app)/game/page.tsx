"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { quizQuestions } from "../../data/questions";

type GameState = "idle" | "playing" | "finished";

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  dailyScore: number;
  badge: string;
  gamesPlayed: number;
}

export default function GamePage() {
  const { user } = useUser();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [answered, setAnswered] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [roundScore, setRoundScore] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [shuffledQuestions, setShuffledQuestions] = useState(quizQuestions);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await axios.get("/api/game");
      if (res.data.alreadyPlayed) {
        setAlreadyPlayed(true);
      }
      setLeaderboard(res.data.leaderboard || []);
    } catch (error) {
      console.log("Failed to fetch leaderboard", error);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (gameState !== "playing" || answered) return;
    if (timeLeft === 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, answered]);

  const startGame = () => {
    if (alreadyPlayed || checking) return;
    setShuffledQuestions([...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10));
    setGameState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setRoundScore(0);
    setTimeLeft(10);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(optionIndex);

    const correct = shuffledQuestions[currentQuestion].answer === optionIndex;
    let points = 0;
    if (correct) {
      points = 10;
      if (timeLeft > 5) points += 5;
    }

    const newScore = score + points;
    const newRoundScore = roundScore + points;
    setScore(newScore);
    setRoundScore(newRoundScore);

    setTimeout(() => {
      if (currentQuestion + 1 >= shuffledQuestions.length) {
        finishGame(newRoundScore);
      } else {
        setCurrentQuestion((q) => q + 1);
        setTimeLeft(10);
        setAnswered(false);
        setSelectedAnswer(null);
      }
    }, 1000);
  };

  const finishGame = async (finalScore: number) => {
    setGameState("finished");
    try {
      await axios.post("/api/game", {
        username: user?.username || user?.emailAddresses[0].emailAddress || "Anonymous",
        score: finalScore,
      });
      fetchLeaderboard();
    } catch (error) {
      console.log("Failed to save score", error);
    }
  };

  const q = shuffledQuestions[currentQuestion];

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h1 className="card-title text-3xl justify-center">🎮 CloudCraft Quiz</h1>
          <p className="text-base-content/70">Test your AI & media knowledge. Earn badges and top the leaderboard!</p>
        </div>
      </div>

      {gameState === "idle" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center space-y-4">
            {alreadyPlayed ? (
              <>
                <div className="text-5xl">✅</div>
                <h2 className="text-xl font-bold">Already played today!</h2>
                <p className="text-base-content/70">Come back tomorrow for a new game. 🎮</p>
                <p className="text-sm text-base-content/50">New game unlocks at midnight</p>
              </>
            ) : (
              <>
                <div className="text-5xl">🧠</div>
                <h2 className="text-xl font-bold">Ready to play?</h2>
                <p className="text-base-content/70">10 questions · 10 seconds each · Earn up to 150 points</p>
                <div className="flex flex-wrap gap-2 justify-center text-sm">
                  <div className="badge badge-warning">🥇 Gold: 100+ pts</div>
                  <div className="badge badge-secondary">🥈 Silver: 50+ pts</div>
                  <div className="badge badge-accent">🥉 Bronze: 20+ pts</div>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={startGame}
                  disabled={checking}
                >
                  {checking ? "Checking..." : "Start Game"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Question {currentQuestion + 1}/10</span>
              <span className={`badge ${timeLeft <= 5 ? "badge-error" : "badge-primary"} text-lg px-4`}>
                ⏱ {timeLeft}s
              </span>
              <span className="text-sm font-medium">Score: {score}</span>
            </div>

            <progress className="progress progress-primary w-full" value={currentQuestion + 1} max={10} />

            <h2 className="text-lg font-bold text-center">{q.question}</h2>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((option, index) => (
                <button
                  key={index}
                  className={`btn w-full ${
                    answered
                      ? index === q.answer
                        ? "btn-success"
                        : index === selectedAnswer
                        ? "btn-error"
                        : "btn-outline"
                      : "btn-outline"
                  }`}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p className="text-lg">You scored <span className="text-primary font-bold">{roundScore} points</span> this round!</p>
            <div className="badge badge-lg badge-primary">
              {roundScore >= 100 ? "🥇 Gold" : roundScore >= 50 ? "🥈 Silver" : roundScore >= 20 ? "🥉 Bronze" : "🎮 Newbie"}
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">🏆 Top 5 Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p className="text-base-content/70 text-center">No players yet — be the first! 🚀</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg bg-base-200 gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xl flex-shrink-0">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs truncate">{entry.username}</p>
                      <p className="text-xs text-base-content/50">{entry.gamesPlayed} games played</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-bold text-primary text-sm whitespace-nowrap">{entry.dailyScore} pts</p>
                    <p className="text-xs whitespace-nowrap">{entry.badge}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}