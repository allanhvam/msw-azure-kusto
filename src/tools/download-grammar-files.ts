import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GRAMMAR_FILES = [
  {
    url: "https://raw.githubusercontent.com/microsoft/Kusto-Query-Language/master/grammar/Kql.g4",
    fileName: "Kql.g4",
  },
  {
    url: "https://raw.githubusercontent.com/microsoft/Kusto-Query-Language/master/grammar/KqlTokens.g4",
    fileName: "KqlTokens.g4",
  },
] as const;

const getProjectRoot = (): string => {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  return path.resolve(currentDir, "../..");
};

const downloadText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
};

const withManagementGrammarReference = (kqlGrammar: string): string => {
  let updated = kqlGrammar;

  if (!updated.includes("import KqlTokens, KqlManagement;")) {
    const replacedImport = updated.replace(/import\s+KqlTokens\s*;/, "import KqlTokens, KqlManagement;");
    if (replacedImport === updated) {
      throw new Error("Unable to add KqlManagement import to Kql.g4");
    }

    updated = replacedImport;
  }

  if (!updated.includes("| managementCommandExpression")) {
    const replacedBeforePipeExpression = updated.replace(
      /beforePipeExpression:\n([\s\S]*?)\n\s*\|\s*unnamedExpression\s*\n\s*;/,
      (match: string, alternatives: string) => {
        if (alternatives.includes("managementCommandExpression")) {
          return match;
        }

        return `beforePipeExpression:\n${alternatives}\n    | managementCommandExpression\n    | unnamedExpression \n    ;`;
      },
    );

    if (replacedBeforePipeExpression === updated) {
      throw new Error("Unable to add managementCommandExpression to beforePipeExpression in Kql.g4");
    }

    updated = replacedBeforePipeExpression;
  }

  return updated;
};

const main = async (): Promise<void> => {
  const projectRoot = getProjectRoot();
  const grammarDir = path.join(projectRoot, "src", "grammar");

  await mkdir(grammarDir, { recursive: true });

  for (const grammarFile of GRAMMAR_FILES) {
    const outputPath = path.join(grammarDir, grammarFile.fileName);
    const downloadedContent = await downloadText(grammarFile.url);
    const content = grammarFile.fileName === "Kql.g4"
      ? withManagementGrammarReference(downloadedContent)
      : downloadedContent;
    await writeFile(outputPath, content, "utf8");
    console.log(`Downloaded ${grammarFile.fileName}`);
  }

  console.log(`Grammar files are updated in ${grammarDir}`);
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});