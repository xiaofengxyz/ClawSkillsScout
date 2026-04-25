function parseScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function isMeaningfulLine(line) {
  const trimmed = line.trim();
  return trimmed !== '' && !trimmed.startsWith('#');
}

function lineIndent(line) {
  return line.length - line.trimStart().length;
}

function nextMeaningfulLine(lines, startIndex) {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (isMeaningfulLine(lines[index])) {
      return { index, line: lines[index] };
    }
  }
  return null;
}

function readBlockString(lines, keyIndent, startIndex, indicator) {
  const first = nextMeaningfulLine(lines, startIndex);
  if (!first || lineIndent(first.line) <= keyIndent) {
    return { value: '', nextIndex: startIndex };
  }

  const blockIndent = lineIndent(first.line);
  const blockLines = [];
  let index = startIndex;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      blockLines.push('');
      continue;
    }
    if (lineIndent(line) < blockIndent) break;
    blockLines.push(line.slice(blockIndent));
  }

  const value =
    indicator.startsWith('>') ? blockLines.map((line) => line.trim()).join(' ').trim() : blockLines.join('\n');
  return { value, nextIndex: index - 1 };
}

function ensureObjectParent(frame) {
  if (!frame || frame.type !== 'object') {
    throw new Error('Frontmatter parser expected an object parent.');
  }
  return frame.value;
}

function inferContainerType(lines, startIndex, currentIndent) {
  const next = nextMeaningfulLine(lines, startIndex);
  if (!next || lineIndent(next.line) <= currentIndent) {
    return 'object';
  }
  return next.line.trimStart().startsWith('- ') ? 'array' : 'object';
}

export function parseSkillFrontmatter(skillText) {
  const match = skillText.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = match[1].replaceAll('\r', '').split('\n');
  const root = {};
  const stack = [{ indent: -1, type: 'object', value: root }];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!isMeaningfulLine(rawLine)) continue;

    const indent = lineIndent(rawLine);
    const trimmed = rawLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const frame = stack[stack.length - 1];
    if (trimmed.startsWith('- ')) {
      if (!frame || frame.type !== 'array') {
        throw new Error(`Frontmatter parser encountered an unexpected list item: ${trimmed}`);
      }
      frame.value.push(parseScalar(trimmed.slice(2)));
      continue;
    }

    const keyMatch = trimmed.match(/^([A-Za-z0-9_-]+):(.*)$/);
    if (!keyMatch) continue;

    const [, key, rawValue] = keyMatch;
    const value = rawValue.trim();
    const parent = ensureObjectParent(frame);

    if (!value) {
      const containerType = inferContainerType(lines, index + 1, indent);
      const container = containerType === 'array' ? [] : {};
      parent[key] = container;
      stack.push({ indent, type: containerType, value: container });
      continue;
    }

    if (/^[>|]/.test(value)) {
      const block = readBlockString(lines, indent, index + 1, value);
      parent[key] = block.value;
      index = block.nextIndex;
      continue;
    }

    parent[key] = parseScalar(value);
  }

  return root;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item.trim());
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

export function extractPackageMetadata(skillText) {
  const frontmatter = parseSkillFrontmatter(skillText);
  const metadata = frontmatter?.metadata ?? {};
  const metadataNamespace = ['aisa', 'openclaw', 'clawdbot', 'clawdis'].find((key) => metadata?.[key]) ?? null;
  const runtimeMetadata = metadataNamespace ? metadata[metadataNamespace] : {};
  const requires = runtimeMetadata?.requires ?? frontmatter?.requires ?? {};

  return {
    requiredBins: ensureArray(requires.bins),
    requiredEnv: ensureArray(requires.env),
    primaryEnv:
      typeof runtimeMetadata?.primaryEnv === 'string'
        ? runtimeMetadata.primaryEnv.trim()
        : typeof frontmatter?.primaryEnv === 'string'
          ? frontmatter.primaryEnv.trim()
          : '',
    compatibility: ensureArray(runtimeMetadata?.compatibility),
    metadataNamespace,
  };
}
