// Minimal syntax highlighter for code elements
// Produces HTML with <span> tags for keywords, strings, comments, numbers

const LANGUAGES = {
  javascript: {
    keywords: ['async','await','break','case','catch','class','const','continue','debugger','default',
      'delete','do','else','export','extends','finally','for','from','function','if','import','in',
      'instanceof','let','new','of','return','static','super','switch','this','throw','try','typeof',
      'var','void','while','with','yield'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
    strings: ['"', "'", '`'],
  },
  python: {
    keywords: ['False','None','True','and','as','assert','async','await','break','class','continue',
      'def','del','elif','else','except','finally','for','from','global','if','import','in','is',
      'lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield'],
    lineComment: '#',
    blockComment: null,
    strings: ['"', "'"],
  },
  csharp: {
    keywords: ['abstract','as','base','bool','break','byte','case','catch','char','checked','class',
      'const','continue','decimal','default','delegate','do','double','else','enum','event','explicit',
      'extern','false','finally','fixed','float','for','foreach','goto','if','implicit','in','int',
      'interface','internal','is','lock','long','namespace','new','null','object','operator','out',
      'override','params','private','protected','public','readonly','ref','return','sbyte','sealed',
      'short','sizeof','stackalloc','static','string','struct','switch','this','throw','true','try',
      'typeof','uint','ulong','unchecked','unsafe','ushort','using','var','virtual','void','volatile','while','async','await'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
    strings: ['"', "'"],
  },
  java: {
    keywords: ['abstract','assert','boolean','break','byte','case','catch','char','class','const',
      'continue','default','do','double','else','enum','extends','final','finally','float','for',
      'goto','if','implements','import','instanceof','int','interface','long','native','new','null',
      'package','private','protected','public','return','short','static','strictfp','super','switch',
      'synchronized','this','throw','throws','transient','try','void','volatile','while','true','false','var'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
    strings: ['"', "'"],
  },
  go: {
    keywords: ['break','case','chan','const','continue','default','defer','else','fallthrough','for',
      'func','go','goto','if','import','interface','map','package','range','return','select','struct',
      'switch','type','var','nil','true','false','iota','append','cap','close','complex','copy',
      'delete','imag','len','make','new','panic','print','println','real','recover'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
    strings: ['"', "'", '`'],
  },
  rust: {
    keywords: ['as','async','await','break','const','continue','crate','dyn','else','enum','extern',
      'false','fn','for','if','impl','in','let','loop','match','mod','move','mut','pub','ref',
      'return','self','Self','static','struct','super','trait','true','type','unsafe','use','where',
      'while','Box','Option','Result','Some','None','Ok','Err','Vec','String','println','macro_rules'],
    lineComment: '//',
    blockComment: ['/*', '*/'],
    strings: ['"'],
  },
};

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlight(code, language) {
  const lang = LANGUAGES[language];
  if (!lang) return escapeHtml(code);

  const keywordSet = new Set(lang.keywords);
  const result = [];
  let i = 0;

  while (i < code.length) {
    // Block comment
    if (lang.blockComment && code.startsWith(lang.blockComment[0], i)) {
      const end = code.indexOf(lang.blockComment[1], i + lang.blockComment[0].length);
      const endIdx = end === -1 ? code.length : end + lang.blockComment[1].length;
      result.push(`<span class="hl-comment">${escapeHtml(code.slice(i, endIdx))}</span>`);
      i = endIdx;
      continue;
    }

    // Line comment
    if (lang.lineComment && code.startsWith(lang.lineComment, i)) {
      const end = code.indexOf('\n', i);
      const endIdx = end === -1 ? code.length : end;
      result.push(`<span class="hl-comment">${escapeHtml(code.slice(i, endIdx))}</span>`);
      i = endIdx;
      continue;
    }

    // Strings
    if (lang.strings && lang.strings.includes(code[i])) {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === quote) { j++; break; }
        if (code[j] === '\n' && quote !== '`') { break; }
        j++;
      }
      result.push(`<span class="hl-string">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) && (i === 0 || /[\s(,=+\-*/<>[\]{};:]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9a-fA-FxXoObB._]/.test(code[j])) j++;
      result.push(`<span class="hl-number">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (keywordSet.has(word)) {
        result.push(`<span class="hl-keyword">${escapeHtml(word)}</span>`);
      } else {
        result.push(escapeHtml(word));
      }
      i = j;
      continue;
    }

    // Everything else
    result.push(escapeHtml(code[i]));
    i++;
  }

  return result.join('');
}

const LANGUAGE_NAMES = {
  javascript: 'JavaScript',
  python: 'Python',
  csharp: 'C#',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
};

function tokenize(code, language) {
  const lang = LANGUAGES[language];
  if (!lang) return [{ text: code, type: 'plain' }];

  const keywordSet = new Set(lang.keywords);
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    if (lang.blockComment && code.startsWith(lang.blockComment[0], i)) {
      const end = code.indexOf(lang.blockComment[1], i + lang.blockComment[0].length);
      const endIdx = end === -1 ? code.length : end + lang.blockComment[1].length;
      tokens.push({ text: code.slice(i, endIdx), type: 'comment' });
      i = endIdx;
      continue;
    }

    if (lang.lineComment && code.startsWith(lang.lineComment, i)) {
      const end = code.indexOf('\n', i);
      const endIdx = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, endIdx), type: 'comment' });
      i = endIdx;
      continue;
    }

    if (lang.strings && lang.strings.includes(code[i])) {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === quote) { j++; break; }
        if (code[j] === '\n' && quote !== '`') { break; }
        j++;
      }
      tokens.push({ text: code.slice(i, j), type: 'string' });
      i = j;
      continue;
    }

    if (/[0-9]/.test(code[i]) && (i === 0 || /[\s(,=+\-*/<>[\]{};:]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9a-fA-FxXoObB._]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      tokens.push({ text: word, type: keywordSet.has(word) ? 'keyword' : 'plain' });
      i = j;
      continue;
    }

    tokens.push({ text: code[i], type: 'plain' });
    i++;
  }

  return tokens;
}

export { highlight, tokenize, LANGUAGES, LANGUAGE_NAMES };
