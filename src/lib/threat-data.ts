export type Severity = "critical" | "high" | "medium" | "low";

export interface Threat {
  id: number;
  /** Persistence key (seed-N or db-uuid) */
  key?: string;
  severity: Severity;
  timestamp: string;
  description: string;
  indicators: { type: "ip" | "file" | "hash" | "user"; value: string }[];
  resolved?: boolean;
  /** Freshly analyzed ticket (latest threat) */
  isNew?: boolean;
  /** No known signature matched — brand new threat type */
  novel?: boolean;
  category?: string;
}

export const THREATS: Threat[] = [
  {
    id: 12,
    severity: "critical",
    timestamp: "4/13/2026, 6:13:38 AM",
    description:
      "A WannaCry ransomware variant has been detected modifying files in the C:\\Windows\\System32 directory, indicating a potential ransomware attack.",
    indicators: [{ type: "file", value: "tasksche.exe" }],
  },
  {
    id: 11,
    severity: "low",
    timestamp: "4/13/2026, 4:34:58 AM",
    description:
      "An authentication attempt for the 'admin' user from IP address 10.0.0.50 failed after 5 attempts within a short time frame, indicating a potential brute force attack.",
    indicators: [{ type: "ip", value: "10.0.0.50" }],
  },
  {
    id: 10,
    severity: "critical",
    timestamp: "4/13/2026, 4:34:14 AM",
    description:
      "A hash mismatch was detected for the critical system binary smss.exe, indicating potential tampering or malware infection.",
    indicators: [{ type: "file", value: "smss.exe" }],
  },
  {
    id: 9,
    severity: "critical",
    timestamp: "4/13/2026, 4:10:10 AM",
    description:
      "An unauthorized user successfully logged in to the system via SSH, indicating potential unauthorized access.",
    indicators: [{ type: "user", value: "root" }, { type: "ip", value: "203.0.113.42" }],
  },
  {
    id: 8,
    severity: "high",
    timestamp: "4/13/2026, 3:33:18 AM",
    description:
      "An unauthorized file was uploaded by a user 'john' from IP 192.168.1.10, potentially introducing malicious content into the system.",
    indicators: [{ type: "user", value: "john" }, { type: "ip", value: "192.168.1.10" }],
  },
  {
    id: 7,
    severity: "critical",
    timestamp: "4/12/2026, 2:12:04 PM",
    description:
      "A hash mismatch was detected for the critical system binary smss.exe, indicating potential tampering or malware infection.",
    indicators: [{ type: "hash", value: "a1b2c3d4e5f6..." }],
  },
  {
    id: 6,
    severity: "medium",
    timestamp: "4/12/2026, 11:02:44 AM",
    description:
      "Suspicious outbound traffic detected to known C2 server on port 4444. Potential beaconing activity observed from workstation WKS-042.",
    indicators: [{ type: "ip", value: "185.220.101.7" }],
  },
  {
    id: 5,
    severity: "high",
    timestamp: "4/12/2026, 9:47:11 AM",
    description:
      "PowerShell execution with encoded command detected on DC-01. Base64 payload consistent with Cobalt Strike loader signatures.",
    indicators: [{ type: "file", value: "powershell.exe" }],
  },
  {
    id: 4,
    severity: "low",
    timestamp: "4/11/2026, 10:22:03 PM",
    description:
      "Multiple port scan attempts detected from external IP targeting exposed services on the DMZ.",
    indicators: [{ type: "ip", value: "45.83.66.12" }],
  },
  {
    id: 3,
    severity: "medium",
    timestamp: "4/11/2026, 6:15:29 PM",
    description:
      "Anomalous data exfiltration pattern detected: 2.3GB uploaded to unrecognized cloud endpoint by user 'sarah.k'.",
    indicators: [{ type: "user", value: "sarah.k" }],
  },
  {
    id: 2,
    severity: "critical",
    timestamp: "4/6/2026, 8:44:00 AM",
    description:
      "Privilege escalation attempt via known CVE-2024-38063 detected on server SRV-DB-03.",
    indicators: [{ type: "file", value: "tcpip.sys" }],
  },
  {
    id: 1,
    severity: "high",
    timestamp: "4/6/2026, 7:12:20 AM",
    description:
      "Lateral movement detected: SMB connections from compromised host to 14 internal endpoints within 3 minutes.",
    indicators: [{ type: "ip", value: "10.0.14.88" }],
  },
];

export const severityColor: Record<Severity, string> = {
  critical: "text-neon-red",
  high: "text-neon-amber",
  medium: "text-neon-cyan",
  low: "text-neon-green",
};

export const severityBorder: Record<Severity, string> = {
  critical: "neon-border-red",
  high: "neon-border-amber",
  medium: "neon-border-blue",
  low: "neon-border-green",
};
