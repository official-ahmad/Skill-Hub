import { useState } from "react";
import { BookOpen, Code, Database, Globe, Terminal } from "lucide-react";
import { categoryAssets } from "./data/assetMappings";

export default function CategoryIcon({ category, size = 18 }) {
  const text = String(category || "").toLowerCase();
  const image = categoryAssets[category];
  const [imageFailed, setImageFailed] = useState(false);
  const props = { size, strokeWidth: 1.5, "aria-hidden": true };

  if (image && !imageFailed) return <img className="category-image" src={image} alt="" width={size} height={size} onError={() => setImageFailed(true)} />;
  if (text === "all") return <BookOpen {...props} />;

  if (/database|\bsql\b/.test(text)) return <Database {...props} />;
  if (/devops|computer science|systems|\bdsa\b|\bc\+\+\b/.test(text))
    return <Terminal {...props} />;
  if (/web|frontend|front-end|backend|back-end/.test(text))
    return <Globe {...props} />;
  return <Code {...props} />;
}
