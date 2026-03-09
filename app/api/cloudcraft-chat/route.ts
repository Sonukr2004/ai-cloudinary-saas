import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    const systemPrompt = `
You are CloudCraft Chat, a smart and friendly AI assistant for CloudCraft Studio.

Here is exactly how CloudCraft Studio works — use this to guide users accurately:

🔐 AUTHENTICATION:
- Sign up / sign in via Clerk using GitHub, Google, or email + password.

🏠 HOME PAGE (Video Library):
- Shows all uploaded videos with compression stats and download buttons.
- Displays total videos uploaded and total space saved.
- Empty state shows a "Go to Video Upload" button.

📤 VIDEO UPLOAD PAGE:
- Go to "Video Upload" in the left sidebar.
- Fill in Title, Description, Output Quality (Auto/balanced or other levels), and select a Video File.
- Click "Upload Video" — Cloudinary compresses it automatically.
- Tracks original vs compressed size to show space saved.

🖼️ SOCIAL SHARE PAGE:
- Go to "Social Share" in the left sidebar.
- Upload an image → CloudCraft generates perfectly sized versions for Instagram, Twitter, Facebook, LinkedIn.
- Cloudinary handles all resizing, cropping, formatting, filters, and overlay text.

💬 TALK TO CLOUDCRAFT: This chat page — ask anything about the app.

ℹ️ ABOUT PAGE: Overview of all features with tabs (All, Overview, Video, Images, Auth).

When users ask how to do something, guide them step by step to the right page.
You can also help with general knowledge, coding, math, science, writing, and casual chat.
Do not fabricate features not listed above.
    `.trim();

    const chatMessages = [
      { role: "user", content: `[Instructions]: ${systemPrompt}` },
      { role: "assistant", content: "Understood! I know exactly how CloudCraft Studio works and I'm ready to help." },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": request.headers.get("origin") || "http://localhost:3000",
          "X-Title": "CloudCraft Chat",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_CHAT_MODEL || "google/gemma-3-4b-it:free",
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json();
      console.error("OpenRouter error body:", JSON.stringify(errorData, null, 2));
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const data = await openRouterResponse.json();
    const responseContent =
      data.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ message: { content: responseContent } });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Too many requests! The AI is overwhelmed. Please try again tomorrow. " },
      { status: 500 }
    );
  }
}