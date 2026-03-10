"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

const questions = [
  { question: "What does AI stand for?", options: ["Automated Integration", "Artificial Intelligence", "Advanced Interface", "Auto Imaging"], answer: 1 },
  { question: "Which format is best for social media videos?", options: ["AVI", "MOV", "MP4", "WMV"], answer: 2 },
  { question: "What does Cloudinary primarily do?", options: ["Database management", "Media optimization & delivery", "Code hosting", "Email marketing"], answer: 1 },
  { question: "What is video compression?", options: ["Making video louder", "Reducing file size while keeping quality", "Adding filters", "Changing resolution"], answer: 1 },
  { question: "Which image format supports transparency?", options: ["JPG", "BMP", "PNG", "GIF"], answer: 2 },
  { question: "What does CDN stand for?", options: ["Content Delivery Network", "Central Data Node", "Cloud Distribution Net", "Content Data Node"], answer: 0 },
  { question: "What is the ideal aspect ratio for Instagram square posts?", options: ["16:9", "4:5", "1:1", "3:2"], answer: 2 },
  { question: "What does 4K resolution mean?", options: ["4000 colors", "~4000 pixels wide", "4GB file size", "4 frames per second"], answer: 1 },
  { question: "Which platform uses 16:9 aspect ratio for covers?", options: ["Instagram", "Twitter", "LinkedIn", "Pinterest"], answer: 1 },
  { question: "What is a keyframe in video?", options: ["A deleted frame", "A frame that defines start/end of transition", "A blurry frame", "A duplicate frame"], answer: 1 },
];

type GameState = "idle" | "playing" | "finished";

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
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
  const [shuffledQuestions, setShuffledQuestions] = useState(questions);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await axios.get("/api/game");
      if (res.data.alreadyPlayed) {
        setAlreadyPlayed(true);
      }
      setLeaderboard(res.data.leaderboard || []);
    } catch (error) {
      console.log("Failed to fetch leaderboard", error);
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
    if (alreadyPlayed) return;
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
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
    setScore((s) => s + points);
    setRoundScore((s) => s + points);

    setTimeout(() => {
      if (currentQuestion + 1 >= shuffledQuestions.length) {
        finishGame(score + points);
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
                <button className="btn btn-primary btn-lg" onClick={startGame}>
                  Start Game
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
                  className={`btn btn-outline w-full ${
                    answered
                      ? index === q.answer
                        ? "btn-success"
                        : index === selectedAnswer
                        ? "btn-error"
                        : ""
                      : "hover:btn-primary"
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
                <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </span>
                    <div>
                      <p className="font-bold">{entry.username}</p>
                      <p className="text-xs text-base-content/50">{entry.gamesPlayed} games played</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{entry.score} pts</p>
                    <p className="text-xs">{entry.badge}</p>
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