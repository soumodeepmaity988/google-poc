import {NextResponse} from "next/server";
import {getGoogleAgentAuthToken} from "../../lib/google-auth";

function extractSessionIdFromName(name: string): string | null {
  const match = name.match(/\/sessions\/(\d+)\//);
  return match ? match[1] : null;
}

export async function POST(req: Request) {
  try {
    const {projectId, location, agentId, userId} = await req.json();

    const token = await getGoogleAgentAuthToken();

    const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/reasoningEngines/${agentId}/sessions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        userId, // ✅ camelCase
      }),
    });

    const data = await response.json();

    const sessionId = extractSessionIdFromName(data.name);

    if (!response.ok) {
      console.error("Vertex API error:", data);
      return NextResponse.json(
        {error: "Failed to create session", details: data},
        {status: response.status}
      );
    }


    return NextResponse.json({sessionId});
  } catch (error: any) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      {
        error: "Failed to create session",
        details: error instanceof Error ? error.message : String(error),
      },
      {status: 500}
    );
  }
}
