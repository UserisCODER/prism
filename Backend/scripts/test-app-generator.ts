import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGenerate() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing App Generator with GEMINI_API_KEY:', apiKey ? 'Loaded' : 'Missing');

  const payload = {
    prompt: 'Build a Sales CRM with lead scoring and automatic deal follow-ups',
  };

  try {
    const res = await fetch('http://localhost:3000/api/v1/apps/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Workspace Created:', data?.data?.workspace?.name);
    console.log('Projects:', data?.data?.projects?.length);
    console.log('Agents:', data?.data?.agents?.length);
    console.log('Workflows:', data?.data?.workflows?.length);
  } catch (err) {
    console.error('Test run error:', err);
  }
}

testGenerate();
