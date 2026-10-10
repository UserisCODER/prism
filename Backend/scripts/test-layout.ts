interface Intent {
  goal: string;
  domain: string;
  entities: string[];
  urgency: string;
  deadline?: string;
  confidence: number;
}

const testIntents: Intent[] = [
  {
    goal: "Prepare for upcoming quarterly business review meeting with Acme Corp",
    domain: "meetings",
    entities: ["Acme Corp", "QBR", "Sarah Connor"],
    urgency: "high",
    deadline: "tomorrow 10:00 AM",
    confidence: 0.95,
  },
  {
    goal: "Analyze recent drop in conversion rates and user retention for Q3",
    domain: "analytics",
    entities: ["Q3", "Conversion Rate", "User Retention", "Checkout Funnel"],
    urgency: "medium",
    confidence: 0.89,
  },
  {
    goal: "Review overdue project deliverables and unblock pending sprint tasks",
    domain: "tasks",
    entities: ["Sprint 24", "Frontend Milestone", "Critical Bugfix"],
    urgency: "critical",
    deadline: "today 5:00 PM",
    confidence: 0.92,
  },
];

async function runLayoutTests(): Promise<void> {
  const url = "http://localhost:3000/api/layout";

  for (let i = 0; i < testIntents.length; i++) {
    const intent = testIntents[i];
    console.log(`\n==================================================`);
    console.log(`[Test ${i + 1}/${testIntents.length}] Domain: "${intent.domain}"`);
    console.log(`Intent Goal: "${intent.goal}"`);
    console.log(`==================================================`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intent }),
      });

      console.log(`Status: ${response.status} ${response.statusText}`);

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        console.log("Response:");
        console.log(JSON.stringify(data, null, 2));
      } catch {
        console.log("Response (raw text):", text);
      }
    } catch (error) {
      console.error(`Error sending request for domain "${intent.domain}":`, error);
    }
  }
}

runLayoutTests();
