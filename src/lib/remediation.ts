import type { Severity } from "./threat-data";

export interface Playbook {
  keywords: string[];
  title: string;
  plain: string;
  steps: string[];
  severity: Severity;
}

/** Dummy knowledge base — plain-language explanations + fix methods (frontend only). */
export const PLAYBOOKS: Playbook[] = [
  {
    keywords: ["brute", "failed login", "authentication", "password", "admin"],
    title: "Repeated failed logins (brute force)",
    plain:
      "Someone is guessing passwords over and over. Nothing is broken yet — it is like a stranger trying many keys on your door.",
    steps: [
      "Block or rate-limit the source IP at the firewall for 24 hours.",
      "Enable account lockout after 5 failed attempts.",
      "Turn on multi-factor authentication for the targeted account.",
      "Confirm no attempt actually succeeded in the auth log.",
    ],
    severity: "low",
  },
  {
    keywords: ["port scan", "scan", "dmz", "recon"],
    title: "Port scanning / reconnaissance",
    plain:
      "An outsider is checking which doors of your network are open. It is information gathering, not an intrusion.",
    steps: [
      "Verify only intended services are exposed on the DMZ.",
      "Drop traffic from the scanning IP range at the edge.",
      "Close or firewall any unexpected open port you find.",
      "Keep monitoring — scans often come before a real attempt.",
    ],
    severity: "low",
  },
  {
    keywords: ["exfil", "upload", "cloud", "data", "2.3gb"],
    title: "Unusual data upload",
    plain:
      "A user sent much more data outside than usual. It may be normal work, or it may be data leaving the company.",
    steps: [
      "Ask the user to confirm the transfer was intentional.",
      "Check the destination domain against your allow-list.",
      "Temporarily restrict large uploads for that account.",
      "Escalate to HIGH if the destination is unknown.",
    ],
    severity: "medium",
  },
  {
    keywords: ["c2", "beacon", "outbound", "4444"],
    title: "Suspicious outbound traffic (possible beaconing)",
    plain:
      "A machine is quietly calling out to a server known for controlling infected computers.",
    steps: [
      "Isolate the workstation from the network.",
      "Block the destination IP and port everywhere.",
      "Run a full malware scan and review scheduled tasks.",
      "Rotate credentials used on that machine.",
    ],
    severity: "medium",
  },
  {
    keywords: ["hash", "mismatch", "tamper", "smss"],
    title: "System file hash mismatch",
    plain:
      "A core Windows file no longer matches its known-good fingerprint — it may have been replaced.",
    steps: [
      "Isolate the host immediately.",
      "Compare the file against a clean image or vendor hash.",
      "Restore from backup or reimage the machine.",
      "Hunt for the same file hash on other hosts.",
    ],
    severity: "critical",
  },
  {
    keywords: ["ransom", "wannacry", "encrypt", "tasksche"],
    title: "Ransomware activity",
    plain:
      "Malware is changing protected system files and may start locking your data for payment.",
    steps: [
      "Disconnect the host from network and storage right now.",
      "Preserve memory and disk for forensics before cleanup.",
      "Check backups are offline and restorable.",
      "Notify incident response and management.",
    ],
    severity: "critical",
  },
];

export function findPlaybook(query: string): Playbook | null {
  const q = query.toLowerCase();
  let best: { p: Playbook; score: number } | null = null;
  for (const p of PLAYBOOKS) {
    const score = p.keywords.filter((k) => q.includes(k)).length;
    if (score > 0 && (!best || score > best.score)) best = { p, score };
  }
  return best?.p ?? null;
}

export function answer(query: string): string {
  const p = findPlaybook(query);
  if (!p) {
    return [
      "I could not match that to a known pattern yet.",
      "",
      "Try describing it in simple words — for example \"many failed admin logins\", \"port scan from outside\", \"large upload to cloud\", or paste part of the alert text.",
      "",
      "General method for LOW severity threats:",
      "1. Confirm it is real (check the raw log line).",
      "2. Contain cheaply (block IP, lock account).",
      "3. Note it and watch for repeats.",
      "4. Close it if there is no follow-up activity in 24h.",
    ].join("\n");
  }
  return [
    `**${p.title}** — suggested severity: ${p.severity.toUpperCase()}`,
    "",
    `In plain words: ${p.plain}`,
    "",
    "How to solve it:",
    ...p.steps.map((s, i) => `${i + 1}. ${s}`),
  ].join("\n");
}
