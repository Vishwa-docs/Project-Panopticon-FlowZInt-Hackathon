import fs from "node:fs";
import path from "node:path";
import { RetrievedDocument, VectorIndex, VectorIndexEntry } from "@/types/panopticon";
import { termFrequency, tokenize } from "@/lib/text";

const KB_PATH = path.join(process.cwd(), "data", "synthetic_kb.md");
const INDEX_PATH = path.join(process.cwd(), "data", "vector-index.json");

interface ParsedSection {
  title: string;
  tags: string[];
  text: string;
}

export function parseKnowledgeBase(markdown = fs.readFileSync(KB_PATH, "utf8")): ParsedSection[] {
  return markdown
    .split(/\n## /)
    .slice(1)
    .map((raw, index) => {
      const section = index === 0 ? raw.replace(/^## /, "") : raw;
      const [titleLine, ...bodyLines] = section.trim().split("\n");
      const tagsLine = bodyLines.find((line) => line.toLowerCase().startsWith("tags:")) ?? "";
      const tags = tagsLine
        .replace(/^tags:\s*/i, "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const text = bodyLines.filter((line) => !line.toLowerCase().startsWith("tags:")).join("\n").trim();
      return {
        title: titleLine.trim(),
        tags,
        text
      };
    });
}

export function buildVectorIndex(): VectorIndex {
  const sections = parseKnowledgeBase();
  const documents: VectorIndexEntry[] = sections.map((section, index) => {
    const tokens = tokenize(`${section.title} ${section.tags.join(" ")} ${section.text}`);
    return {
      id: `kb-${String(index + 1).padStart(2, "0")}`,
      title: section.title,
      section: section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      text: section.text,
      tags: section.tags,
      tokens,
      termFrequency: termFrequency(tokens)
    };
  });

  const docCount = documents.length;
  const vocabulary = new Set(documents.flatMap((doc) => Object.keys(doc.termFrequency)));
  const inverseDocumentFrequency: Record<string, number> = {};
  for (const token of vocabulary) {
    const containingDocs = documents.filter((doc) => doc.termFrequency[token] !== undefined).length;
    inverseDocumentFrequency[token] = Math.log((1 + docCount) / (1 + containingDocs)) + 1;
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    documents,
    inverseDocumentFrequency
  };
}

export function writeVectorIndex(): VectorIndex {
  const index = buildVectorIndex();
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

export function loadVectorIndex(): VectorIndex {
  if (!fs.existsSync(INDEX_PATH)) {
    return writeVectorIndex();
  }
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8")) as VectorIndex;
}

function cosineScore(queryTokens: string[], doc: VectorIndexEntry, idf: Record<string, number>): number {
  const queryTf = termFrequency(queryTokens);
  let dot = 0;
  let queryMagnitude = 0;
  let docMagnitude = 0;

  const vocabulary = new Set([...Object.keys(queryTf), ...Object.keys(doc.termFrequency)]);
  for (const token of vocabulary) {
    const weight = idf[token] ?? 1;
    const queryWeight = (queryTf[token] ?? 0) * weight;
    const docWeight = (doc.termFrequency[token] ?? 0) * weight;
    dot += queryWeight * docWeight;
    queryMagnitude += queryWeight * queryWeight;
    docMagnitude += docWeight * docWeight;
  }

  if (queryMagnitude === 0 || docMagnitude === 0) {
    return 0;
  }
  return dot / (Math.sqrt(queryMagnitude) * Math.sqrt(docMagnitude));
}

export function searchKnowledgeBase(query: string, topK = 3): RetrievedDocument[] {
  const index = loadVectorIndex();
  const queryTokens = tokenize(query);
  return index.documents
    .map((doc) => {
      const tagBoost = doc.tags.some((tag) => queryTokens.includes(tag)) ? 0.08 : 0;
      return {
        id: doc.id,
        title: doc.title,
        section: doc.section,
        text: doc.text,
        tags: doc.tags,
        score: cosineScore(queryTokens, doc, index.inverseDocumentFrequency) + tagBoost
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
