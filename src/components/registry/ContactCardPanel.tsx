import React from 'react';
import { UserCheck, Mail, PhoneCall } from 'lucide-react';
import { seededContacts } from '../../data/seededDatabase';

export const ContactCardPanel: React.FC = () => {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-heading font-bold text-white text-base">
          Key Stakeholders & Contacts
        </h3>
        <span className="text-xs font-mono text-slate-400">MERIDIAN LABS</span>
      </div>

      <div className="mt-4 space-y-3">
        {seededContacts.map((ct) => (
          <div
            key={ct.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3.5 transition-all hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 font-bold text-white text-xs">
                {ct.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-heading text-xs font-bold text-white">{ct.name}</h4>
                <p className="text-[11px] text-slate-400">{ct.role}</p>
                <span className="text-[10px] font-mono text-indigo-300">{ct.email}</span>
              </div>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                ct.sentiment === 'at_risk' || ct.sentiment === 'negative'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {ct.sentiment}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
