"use server";

import { cookies } from "next/headers";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createServerClient } from "@supabase/ssr";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function getSupabaseClient() {
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

// --- PROFILE ACTIONS ---

export async function saveProfile(data: { role: "candidate" | "recruiter"; first_name: string; last_name: string }) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { error } = await supabase.from("profiles").upsert({
    id: userData.user.id,
    role: data.role,
    first_name: data.first_name,
    last_name: data.last_name,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  revalidatePath("/", "layout");
  revalidatePath("/profile");
}

export async function updateProfileResume(resumePath: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { error } = await supabase
    .from("profiles")
    .update({ resume_path: resumePath, updated_at: new Date().toISOString() })
    .eq("id", userData.user.id);

  if (error) throw error;
  revalidatePath("/profile");
}

export async function getProfile() {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (error) return null;
  return data;
}

export async function logout() {
  const supabase = await getSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function uploadResume(formData: FormData): Promise<{ resumePath: string, fileName: string }> {
  const file = formData.get("resume");
  if (!file || !(file instanceof File)) {
    throw new Error("Resume PDF is required.");
  }

  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const userId = userData.user.id;
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const resumePath = `${userId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("resumes").upload(resumePath, file, {
    upsert: true,
  });

  if (uploadError) throw uploadError;

  return { resumePath, fileName: file.name };
}

export async function saveCandidateResume(fileName: string, filePath: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { error } = await supabase.from("resumes").insert({
    candidate_id: userData.user.id,
    file_name: fileName,
    file_path: filePath,
  });

  if (error) throw error;
  revalidatePath("/profile");
}

export async function getCandidateResumes() {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return [];

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("candidate_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function deleteCandidateResume(resumeId: string, filePath: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  // Delete from DB
  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("candidate_id", userData.user.id);
    
  if (error) throw error;

  // Attempt to delete from storage (ignore errors if it fails)
  await supabase.storage.from("resumes").remove([filePath]);

  revalidatePath("/profile");
}

// --- JOB ACTIONS ---

export async function createJob(data: { title: string; description: string }) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { error } = await supabase.from("jobs").insert({
    recruiter_id: userData.user.id,
    title: data.title,
    description: data.description,
  });

  if (error) throw error;
  revalidatePath("/dashboard/recruiter");
}

export async function getJobs(searchQuery?: string) {
  const supabase = await getSupabaseClient();
  let query = supabase.from("jobs").select(`*, profiles(first_name, last_name)`).order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getJobById(id: string) {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(`*, profiles(first_name, last_name)`)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getRecruiterJobs() {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error("No authenticated user found.");
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("recruiter_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // also fetch notifications count per job
  const jobsWithCounts = await Promise.all(data.map(async (job: any) => {
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", job.id)
      .eq("is_new", true)
      .eq("status", "applied");
    return { ...job, new_applications_count: count || 0 };
  }));

  return jobsWithCounts;
}

// --- APPLICATION & MATCH ACTIONS ---

async function extractTextFromPDF(supabase: any, resumePath: string): Promise<string> {
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
  return resumeText;
}

export async function calculateJobMatch(jobId: string, overrideResumePath?: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");
  const candidateId = userData.user.id;

  // 1. Get profile
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", candidateId).single();
  if (profileError) throw new Error("Profile not found.");

  // Determine which resume to use
  let finalResumePath = overrideResumePath;
  if (!finalResumePath) {
    if (profile.resume_path) {
      finalResumePath = profile.resume_path;
    } else {
      throw new Error("Por favor, sube un currículum primero.");
    }
  }

  if (!finalResumePath) {
    throw new Error("Por favor, sube un currículum primero.");
  }

  // 2. Get Job description
  const { data: job, error: jobError } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  if (jobError || !job) throw new Error("Job not found.");

  // 3. Extract text
  const resumeText = await extractTextFromPDF(supabase, finalResumePath);

  // 4. Ask Gemini
  const prompt = `You are a hiring match assistant. Compare the candidate resume text and the job description below. Return ONLY valid JSON with this exact shape: { \"match_score\": number, \"missing_keywords\": string[], \"action_plan\": string }. Resume text: ${resumeText}\n\nJob description: ${job.description}\n\nRespond only with JSON. Do not include any markdown, explanations or extra text.`;

  assertServerEnv();
  const genAI = new GoogleGenerativeAI(googleApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: "Return only a JSON object with match_score, missing_keywords, and action_plan.",
    generationConfig: { responseMimeType: "application/json" },
  });

  const text = result?.response?.text?.();
  if (!text) throw new Error("No response from Gemini.");

  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
  else if (cleanText.startsWith("```")) cleanText = cleanText.substring(3);
  if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
  cleanText = cleanText.trim();

  let parsed: MatchAnalysisResult;
  try {
    const rawParsed = JSON.parse(cleanText);
    parsed = {
      match_score: Number(rawParsed.match_score ?? 0),
      missing_keywords: Array.isArray(rawParsed.missing_keywords) ? rawParsed.missing_keywords.map(String) : [],
      action_plan: String(rawParsed.action_plan ?? ""),
    };
  } catch (error) {
    throw new Error("Failed to parse Gemini response as JSON.");
  }

  // 5. Save to database
  const { data: application, error: upsertError } = await supabase.from("applications").upsert({
    job_id: jobId,
    candidate_id: candidateId,
    match_score: parsed.match_score,
    missing_keywords: parsed.missing_keywords,
    action_plan: parsed.action_plan,
    status: 'calculated',
    updated_at: new Date().toISOString()
  }, { onConflict: 'job_id,candidate_id' }).select().single();

  if (upsertError) throw upsertError;

  revalidatePath(`/jobs/${jobId}`);
  return application;
}

export async function applyToJob(applicationId: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { error } = await supabase
    .from("applications")
    .update({ status: "applied", is_new: true, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .eq("candidate_id", userData.user.id);

  if (error) throw error;
  revalidatePath("/profile");
}

export async function getCandidateApplications() {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { data, error } = await supabase
    .from("applications")
    .select(`*, jobs(*)`)
    .eq("candidate_id", userData.user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getApplicationForJob(jobId: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return null;

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("candidate_id", userData.user.id)
    .single();

  if (error) return null;
  return data;
}

export async function getJobApplications(jobId: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { data, error } = await supabase
    .from("applications")
    .select(`*, profiles(first_name, last_name, resume_path)`)
    .eq("job_id", jobId)
    .neq("status", "calculated")
    .order("match_score", { ascending: false });

  if (error) throw error;
  return data;
}

export async function markApplicationsAsRead(jobId: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return;

  // We rely on RLS to only update if the user is the recruiter
  await supabase
    .from("applications")
    .update({ is_new: false })
    .eq("job_id", jobId);
    
  // Also transition newly seen 'applied' to 'viewed'
  await supabase
    .from("applications")
    .update({ status: "viewed" })
    .eq("job_id", jobId)
    .eq("status", "applied");
}

export async function updateApplicationStatus(applicationId: string, status: "viewed" | "rejected" | "in_progress", message?: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { error } = await supabase
    .from("applications")
    .update({ 
      status, 
      recruiter_message: message || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", applicationId);

  if (error) throw error;
  revalidatePath("/dashboard/recruiter");
}

export async function getResumeUrl(resumePath: string) {
  const supabase = await getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error("No authenticated user found.");

  const { data, error } = await supabase.storage.from("resumes").createSignedUrl(resumePath, 3600); // 1 hour
  if (error) throw error;
  return data.signedUrl;
}

// Keep old analyzeMatch to not break existing DashboardShell just in case, but we will redirect users soon.
export async function analyzeMatch(payload: {
  resumePath: string;
  jobDescription: string;
}): Promise<MatchAnalysisResult> {
  const { resumePath, jobDescription } = payload;
  if (!resumePath) throw new Error("Resume path is required.");
  if (!jobDescription.trim()) throw new Error("Job description is required.");

  const supabase = await getSupabaseClient();
  const resumeText = await extractTextFromPDF(supabase, resumePath);

  const prompt = `You are a hiring match assistant. Compare the candidate resume text and the job description below. Return ONLY valid JSON with this exact shape: { \"match_score\": number, \"missing_keywords\": string[], \"action_plan\": string }. Resume text: ${resumeText}\n\nJob description: ${jobDescription}\n\nRespond only with JSON. Do not include any markdown, explanations or extra text.`;

  assertServerEnv();
  const genAI = new GoogleGenerativeAI(googleApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: "Return only a JSON object with match_score, missing_keywords, and action_plan.",
    generationConfig: { responseMimeType: "application/json" },
  });

  const text = result?.response?.text?.();
  if (!text) throw new Error("No response from Gemini.");

  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
  else if (cleanText.startsWith("```")) cleanText = cleanText.substring(3);
  if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3);
  cleanText = cleanText.trim();

  try {
    const parsed = JSON.parse(cleanText);
    return {
      match_score: Number(parsed.match_score ?? 0),
      missing_keywords: Array.isArray(parsed.missing_keywords) ? parsed.missing_keywords.map(String) : [],
      action_plan: String(parsed.action_plan ?? ""),
    };
  } catch (error) {
    throw new Error("Failed to parse Gemini response as JSON.");
  }
}
