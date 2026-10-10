/**
 * End-to-end chain test script:
 * Utterance -> /api/intent -> /api/layout -> Side-by-side response comparison
 */

interface Intent {
  goal: string;
  domain: string;
  entities: string[];
  urgency: string;
  deadline?: string;
  confidence: number;
}

interface IntentApiResponse {
  clarify?: boolean;
  question?: string;
  options?: string[];
  intent?: Intent;
  error?: string;
  details?: string;
}

interface LayoutPanel {
  component_id: string;
  reason: string;
  priority: number;
  zone: string;
}

interface LayoutApiResponse {
  panels?: LayoutPanel[];
  error?: string;
  details?: string;
}

const utterances: string[] = [
  "Prepare for my meeting with Acme Corp tomorrow",
  "Why did usage drop in Q3?",
  "Show me all overdue projects",
];

const INTENT_API_URL = "http://localhost:3000/api/intent";
const LAYOUT_API_URL = "http://localhost:3000/api/layout";

/**
 * Formats two multi-line string contents side-by-side in ASCII columns.
 */
function formatSideBySide(
  leftHeader: string,
  leftContent: string,
  rightHeader: string,
  rightContent: string,
  colWidth = 56
): string {
  function wrapLines(text: string, maxLen: number): string[] {
    const rawLines = text.split("\n");
    const out: string[] = [];
    for (const raw of rawLines) {
      if (raw.length <= maxLen) {
        out.push(raw);
      } else {
        for (let i = 0; i < raw.length; i += maxLen) {
          out.push(raw.slice(i, i + maxLen));
        }
      }
    }
    return out;
  }

  const leftLines = wrapLines(leftContent, colWidth);
  const rightLines = wrapLines(rightContent, colWidth);
  const maxLines = Math.max(leftLines.length, rightLines.length);

  const divider = `+${"-".repeat(colWidth + 2)}+${"-".repeat(colWidth + 2)}+`;
  const headerLine = `| ${leftHeader.padEnd(colWidth)} | ${rightHeader.padEnd(colWidth)} |`;

  const rows: string[] = [divider, headerLine, divider];

  for (let i = 0; i < maxLines; i++) {
    const left = (leftLines[i] || "").padEnd(colWidth);
    const right = (rightLines[i] || "").padEnd(colWidth);
    rows.push(`| ${left} | ${right} |`);
  }

  rows.push(divider);
  return rows.join("\n");
}

async function runChainTests(): Promise<void> {
  console.log("================================================================================");
  console.log("Starting End-to-End Flow Test: /api/intent -> /api/layout");
  console.log("Total test utterances:", utterances.length);
  console.log("================================================================================\n");

  for (let i = 0; i < utterances.length; i++) {
    const utterance = utterances[i];
    console.log(`\n================================================================================`);
    console.log(`[TEST ${i + 1}/${utterances.length}] Utterance: "${utterance}"`);
    console.log(`================================================================================`);

    let intentResponseRaw = "";
    let layoutResponseRaw = "";
    let extractedIntent: Intent | null = null;
    let clarifyResult: boolean | null = null;
    let parsedIntentJson: IntentApiResponse | null = null;
    let layoutPanels: LayoutPanel[] = [];

    // STEP 1: Call /api/intent
    try {
      console.log(`\n[Step 1] Sending utterance to ${INTENT_API_URL}...`);
      const intentRes = await fetch(INTENT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ utterance }),
      });

      const intentStatus = `HTTP ${intentRes.status} ${intentRes.statusText}`;
      const intentText = await intentRes.text();

      try {
        const intentJson: IntentApiResponse = JSON.parse(intentText);
        parsedIntentJson = intentJson;
        clarifyResult = Boolean(intentJson.clarify);
        intentResponseRaw = `[${intentStatus}]\n` + JSON.stringify(intentJson, null, 2);

        console.log(`[Step 1 Result] clarify: ${clarifyResult}`);

        if (intentJson.intent) {
          extractedIntent = intentJson.intent;
        } else if ("goal" in (intentJson as Record<string, unknown>)) {
          extractedIntent = intentJson as unknown as Intent;
        } else if (intentJson.clarify) {
          console.warn(`[Step 1 Clarification Needed] ${intentJson.question}`);
        }
      } catch (parseErr) {
        intentResponseRaw = `[${intentStatus}]\n` + intentText;
        console.error("[Step 1 Parse Error] Could not parse intent response as JSON:", parseErr);
      }
    } catch (fetchErr) {
      const errMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      intentResponseRaw = `[FETCH ERROR]\n${errMsg}`;
      console.error(`[Step 1 Network Error] Failed to call /api/intent:`, fetchErr);
    }

    // STEP 2: Call /api/layout if intent was extracted
    if (extractedIntent) {
      try {
        console.log(`[Step 2] Passing extracted intent to ${LAYOUT_API_URL}...`);
        const layoutRes = await fetch(LAYOUT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ intent: extractedIntent }),
        });

        const layoutStatus = `HTTP ${layoutRes.status} ${layoutRes.statusText}`;
        const layoutText = await layoutRes.text();

        try {
          const layoutJson: LayoutApiResponse = JSON.parse(layoutText);
          layoutResponseRaw = `[${layoutStatus}]\n` + JSON.stringify(layoutJson, null, 2);
          if (Array.isArray(layoutJson.panels)) {
            layoutPanels = layoutJson.panels;
          }
        } catch (parseErr) {
          layoutResponseRaw = `[${layoutStatus}]\n` + layoutText;
          console.error("[Step 2 Parse Error] Could not parse layout response as JSON:", parseErr);
        }
      } catch (fetchErr) {
        const errMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        layoutResponseRaw = `[FETCH ERROR]\n${errMsg}`;
        console.error(`[Step 2 Network Error] Failed to call /api/layout:`, fetchErr);
      }
    } else {
      layoutResponseRaw = "[SKIPPED]\nNo intent object available to pass to /api/layout.";
      console.warn("[Step 2 Skipped] No valid intent object received from Step 1.");
    }

    // STEP 3: Log clarify status and confidence score alongside layout panels
    console.log(`\n--- Test ${i + 1} Result Summary ---`);
    console.log(`Utterance: "${utterance}"`);
    console.log(`Clarify: ${clarifyResult}`);
    if (clarifyResult === false) {
      const confidence = extractedIntent?.confidence !== undefined ? extractedIntent.confidence : "N/A";
      console.log(`Confidence Score: ${confidence}`);
      console.log(`Layout Panels (Confidence: ${confidence}):`);
      if (layoutPanels.length > 0) {
        layoutPanels.forEach((panel, pIdx) => {
          console.log(
            `  ${pIdx + 1}. [${panel.zone.toUpperCase()}] ${panel.component_id} (Priority: ${panel.priority}, Confidence: ${confidence}) - ${panel.reason}`
          );
        });
      } else {
        console.log(`  (No layout panels returned)`);
      }
    } else if (clarifyResult === true) {
      console.log(`Clarification Question: ${parsedIntentJson?.question || "N/A"}`);
      console.log(`Clarification Options: ${parsedIntentJson?.options ? parsedIntentJson.options.join(", ") : "N/A"}`);
    }

    // STEP 4: Display both responses side by side
    console.log(`\n--- Side-by-Side Comparison [Test ${i + 1}/${utterances.length}] ---`);
    const sideBySideView = formatSideBySide(
      "INTENT RESPONSE (/api/intent)",
      intentResponseRaw,
      "LAYOUT RESPONSE (/api/layout)",
      layoutResponseRaw,
      56
    );
    console.log(sideBySideView);
  }

  console.log("\n================================================================================");
  console.log("End-to-End Chain Test Completed.");
  console.log("================================================================================");
}

runChainTests();
