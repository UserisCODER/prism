import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://prism-topaz-one.vercel.app';

  // Embeddable JavaScript chat widget snippet
  const scriptContent = `
(function() {
  const agentId = "${id}";
  const apiUrl = "${baseUrl}/api/v1/agents/chat";
  
  const container = document.createElement('div');
  container.id = 'prism-ai-agent-widget';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  const button = document.createElement('button');
  button.innerHTML = '✨ Ask AI Agent';
  button.style.backgroundColor = '#18181B';
  button.style.color = '#FFFFFF';
  button.style.border = 'none';
  button.style.borderRadius = '9999px';
  button.style.padding = '12px 20px';
  button.style.fontSize = '14px';
  button.style.fontWeight = '600';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.gap = '8px';

  const modal = document.createElement('div');
  modal.style.display = 'none';
  modal.style.width = '360px';
  modal.style.height = '480px';
  modal.style.backgroundColor = '#FAF8F5';
  modal.style.borderRadius = '16px';
  modal.style.border = '1px solid #E4E0DA';
  modal.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
  modal.style.flexDirection = 'column';
  modal.style.overflow = 'hidden';
  modal.style.marginBottom = '12px';

  modal.innerHTML = \`
    <div style="background: #18181B; color: #fff; padding: 14px 16px; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
      <span>AI Workspace Assistant</span>
      <span id="prism-close-btn" style="cursor: pointer; opacity: 0.7;">✕</span>
    </div>
    <div id="prism-chat-messages" style="flex: 1; padding: 14px; overflow-y: auto; font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
      <div style="background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #E4E0DA;">
        Hello! I am your workspace AI agent. How can I assist you with your tasks or projects?
      </div>
    </div>
    <div style="padding: 10px; border-top: 1px solid #E4E0DA; display: flex; gap: 6px; background: #fff;">
      <input id="prism-chat-input" placeholder="Type a message..." style="flex: 1; padding: 8px 12px; border: 1px solid #E4E0DA; border-radius: 8px; font-size: 13px; outline: none;" />
      <button id="prism-chat-send" style="background: #6366F1; color: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-weight: 600; cursor: pointer;">Send</button>
    </div>
  \`;

  container.appendChild(modal);
  container.appendChild(button);
  document.body.appendChild(container);

  button.onclick = () => {
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
  };

  modal.querySelector('#prism-close-btn').onclick = () => {
    modal.style.display = 'none';
  };

  const input = modal.querySelector('#prism-chat-input');
  const sendBtn = modal.querySelector('#prism-chat-send');
  const messages = modal.querySelector('#prism-chat-messages');

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const userMsg = document.createElement('div');
    userMsg.style.alignSelf = 'flex-end';
    userMsg.style.background = '#6366F1';
    userMsg.style.color = '#fff';
    userMsg.style.padding = '8px 12px';
    userMsg.style.borderRadius = '8px';
    userMsg.innerText = text;
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, agentId })
      });
      const data = await res.json();
      const botMsg = document.createElement('div');
      botMsg.style.alignSelf = 'flex-start';
      botMsg.style.background = '#fff';
      botMsg.style.padding = '10px';
      botMsg.style.borderRadius = '8px';
      botMsg.style.border = '1px solid #E4E0DA';
      botMsg.innerText = data.reply || 'Task processed.';
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    } catch (e) {
      console.error(e);
    }
  }

  sendBtn.onclick = sendMessage;
  input.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };
})();
  `;

  return new NextResponse(scriptContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
