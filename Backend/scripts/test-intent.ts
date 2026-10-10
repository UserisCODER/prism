const utterances: string[] = [
  "Prepare for my meeting with Acme Corp tomorrow",
  "Why did usage drop in Q3?",
  "Show me all overdue projects",
];

async function runTests(): Promise<void> {
  const url = "http://localhost:3000/api/intent";

  for (let i = 0; i < utterances.length; i++) {
    const utterance = utterances[i];
    console.log(`\n==================================================`);
    console.log(`[Test ${i + 1}/${utterances.length}] Utterance: "${utterance}"`);
    console.log(`==================================================`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ utterance }),
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
      console.error(`Error sending request for "${utterance}":`, error);
    }
  }
}

runTests();
