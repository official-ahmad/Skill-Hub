import {
  Atom, Braces, Code2, CodeXml, Coffee, Database, FileCode2, GitBranch,
  Layers3, Network, PanelsTopLeft, Server, Smartphone, Terminal,
} from "lucide-react";

const icons = {
  js: Code2,
  py: CodeXml,
  html: PanelsTopLeft,
  css: PanelsTopLeft,
  c: Braces,
  java: Coffee,
  cpp: Braces,
  sql: Database,
  git: GitBranch,
  react: Atom,
  node: Server,
  dsa: Network,
  linux: Terminal,
  ts: FileCode2,
  django: Layers3,
  flutter: Smartphone,
};

export default function CourseIcon({ course, className = "" }) {
  const Icon = icons[course?.id] || Code2;
  return <Icon aria-hidden="true" className={`course-icon ${className}`} size={18} strokeWidth={1.5} />;
}
