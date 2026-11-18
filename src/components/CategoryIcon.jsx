import { Code, Database, Globe, Terminal } from "lucide-react";

export default function CategoryIcon({ category, size = 18 }) {
  const text = String(category || "").toLowerCase();
  const props = { size, strokeWidth: 1.5, "aria-hidden": true };

  if (/database|\bsql\b/.test(text)) return <Database {...props} />;
  if (/devops|computer science|systems|\bdsa\b|\bc\+\+\b/.test(text))
    return <Terminal {...props} />;
  if (/web|frontend|front-end|backend|back-end/.test(text))
    return <Globe {...props} />;
  return <Code {...props} />;
}
