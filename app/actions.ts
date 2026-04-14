"use server";

import { cookies } from "next/headers";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createServerClient } from "@supabase/ssr";
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const googleApiKey = process.env.GEMINI_API_KEY ?? "";

function assertServerEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  if (!googleApiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }
}

async function getSupabaseClient() {
  assertServerEnv();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // no-op: server actions only need to read the authenticated session
        }
      },
    },
  });
}

export type MatchAnalysisResult = {
  match_score: number;
  missing_keywords: string[];
  action_plan: string;
};

export async function uploadResume(formData: FormData): Promise<{ resumePath: string }> {
  const file = formData.get("resume");
  if (!file || !(file instanceof File)) {
    throw new Error("Resume PDF is required.");
  }

  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw userError;
  }

  const userId = userData?.user?.id;
  if (!userId) {
    throw new Error("No authenticated user found.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const resumePath = `${userId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("resumes").upload(resumePath, file, {
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  return { resumePath };
}

export async function analyzeMatch(payload: {
  resumePath: string;
  jobDescription: string;
}): Promise<MatchAnalysisResult> {
  const { resumePath, jobDescription } = payload;
  if (!resumePath) {
    throw new Error("Resume path is required.");
  }

  if (!jobDescription.trim()) {
    throw new Error("Job description is required.");
  }

  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw userError;
  }

  const userId = userData?.user?.id;
  if (!userId) {
    throw new Error("No authenticated user found.");
  }

  const { data, error: downloadError } = await supabase.storage.from("resumes").download(resumePath);
  if (downloadError || !data) {
    throw new Error(downloadError?.message || "Failed to download resume.");
  }

  const buffer = new Uint8Array(await data.arrayBuffer());
  GlobalWorkerOptions.workerSrc = pathToFileURL(resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")).href;
  const pdfDoc = await getDocument({ data: buffer }).promise;

  let resumeText = "";
  try {
    const pageCount = pdfDoc.numPages;
    for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
      const page = await pdfDoc.getPage(pageIndex);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => (item && typeof item.str === "string" ? item.str : ""))
        .join(" ");
      resumeText += `${pageText}\n`;
    }
  } finally {
    await pdfDoc.destroy();
  }

  const prompt = `You are a hiring match assistant. Compare the candidate resume text and the job description below. Return ONLY valid JSON with this exact shape: { \"match_score\": number, \"missing_keywords\": string[], \"action_plan\": string }. Resume text: ${resumeText}\n\nJob description: ${jobDescription}\n\nRespond only with JSON. Do not include any markdown, explanations or extra text.`;

  assertServerEnv();
  const genAI = new GoogleGenerativeAI(googleApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [{ text: prompt }],
    }],
    systemInstruction: "Return only a JSON object with match_score, missing_keywords, and action_plan.",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const text = result?.response?.text?.();
  if (!text) {
    throw new Error("No response from Gemini.");
  }

  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.slice(0, -3);
  }
  cleanText = cleanText.trim();

  try {
    const parsed = JSON.parse(cleanText);
    return {
      match_score: Number(parsed.match_score ?? 0),
      missing_keywords: Array.isArray(parsed.missing_keywords)
        ? parsed.missing_keywords.map(String)
        : [],
      action_plan: String(parsed.action_plan ?? ""),
    };
  } catch (error) {
    throw new Error("Failed to parse Gemini response as JSON.");
  }
}