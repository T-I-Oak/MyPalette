const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const manifest = process.argv.find(argument => argument.endsWith('.json'));
assert.ok(manifest, 'Pass the phase conditions.json path');
const directory = path.dirname(manifest);
const data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
const write = process.argv.includes('--write');
const escape = value => value.replaceAll('|', '&#124;').replaceAll('\n', ' ');
let count = 0, sections = 0;
const ids = new Set();
const outstanding = [];
for (const chapter of data.chapters) {
    const source = execFileSync('git', ['show', `${data.revision}:docs/requirements/${chapter.file}`], { encoding: 'utf8' });
    assert.equal(fs.readFileSync(`${directory}/evidence/baseline-${chapter.chapter}.txt`, 'utf8'), source);
    const sourceLines = source.split(/\r?\n/);
    let table = false;
    const required = [];
    sourceLines.forEach((line, index) => {
        line = line.trim();
        if (!line || line.startsWith('#') || line === '---' || /^\|[\s:|\-]+\|$/.test(line)) return;
        if (line.startsWith('|') && !table) { table = true; return; }
        if (!line.startsWith('|')) table = false;
        required.push(index + 1);
    });
    for (const line of required) {
        const rows = chapter.conditions.filter(row => row.line === line);
        assert.ok(rows.length, `Unassigned ${chapter.file}:${line}`);
        assert.equal([...new Set(rows.map(row => row.text))].join(''), sourceLines[line - 1].trim(), `Incomplete ${chapter.file}:${line}`);
    }
    for (const row of chapter.conditions) {
        assert.ok(!ids.has(row.id), `Duplicate ${row.id}`); ids.add(row.id);
        assert.ok(required.includes(row.line), `Unexpected source line ${row.id}`);
        assert.ok(chapter.sections.some(section => section.section === row.section), `Unknown section ${row.id}`);
        assert.ok(['実装あり', '未実装', '要求不一致', '説明・許容'].includes(row.classification), `Unclassified ${row.id}`);
        assert.ok(row.note && row.result && row.method, `Missing rationale ${row.id}`);
        if (row.classification === '未実装') assert.ok(row.backlog && row.backlog !== '—', `Missing backlog ${row.id}`);
        if (!['成功', '合否不要', '既存バックログ対応'].includes(row.result)) outstanding.push(row.id);
    }
    count += chapter.conditions.length; sections += chapter.sections.length;
    if (write) {
        const lines = [`# 要求${chapter.chapter}の条件対応表`, '', `基準: \`${data.revision}\`。確認版: \`${data.verificationVersion}\`。原文は[基準スナップショット](evidence/baseline-${chapter.chapter}.txt)。`, '',
            `[判定・実行条件](../${data.report})。実装ありは合格とは異なる。M番号は[手動確認](06.visual_verification.md)、D番号は[実装報告](../${data.report})へ対応する。`, '',
            '## 全節の割当', '', '| 節 | 節名 | 条件ID |', '| --- | --- | --- |'];
        for (const section of chapter.sections) lines.push(`| ${section.section} | ${section.title} | ${chapter.conditions.filter(row => row.section === section.section).map(row => row.id).join('、') || '見出しのみ。子節へ割当。'} |`);
        lines.push('', '## 記述・条件ごとの分類', '', '| ID・原文行 | 節 | 基準原文 | 分類・結果 | 検証／バックログ | 根拠・残る確認 |', '| --- | --- | --- | --- | --- | --- |');
        for (const row of chapter.conditions) {
            const method = row.method === '—' ? '—' : `[${row.method}](07.automated_verification.md#${row.method.toLowerCase()})`;
            lines.push(`| ${row.id} L${row.line} | ${row.section} | ${escape(row.condition || row.text)} | ${row.classification}・${row.result} | ${method}${row.manual ? ` / ${row.manual}` : ''}${row.backlog === '—' ? '' : ` / ${row.backlog}`} | ${escape(row.note)} |`);
        }
        for (const amendment of (data.amendments || []).filter(item => item.file === chapter.file)) {
            lines.push('', `## 承認済み要求変更 ${amendment.id}`, '', amendment.approval, '', '以下を現行の要求として検証する。基準原文の変更対象行は履歴を追跡するため上表に残す。', '',
                '| ID | 承認後の要求 | 結果 | 検証 |', '| --- | --- | --- | --- |');
            for (const row of amendment.conditions) lines.push(`| ${row.id} | ${escape(row.condition || row.text)} | ${row.result} | ${row.method}。${row.note} |`);
        }
        const target = chapter.file;
        fs.writeFileSync(`${directory}/${target}`, lines.join('\n') + '\n');
    }
}
let amendedConditions = 0;
for (const amendment of data.amendments || []) {
    const source = fs.readFileSync(`docs/requirements/${amendment.file}`, 'utf8').replaceAll('\r\n', '\n');
    if (amendment.parentHeading) assert.ok(source.includes(amendment.parentHeading));
    const actual = source.split(amendment.heading)[1].split(/^#{2,3} |^---\s*$/m)[0].trim();
    assert.equal(actual, amendment.text.replaceAll('\r\n', '\n'), `Approved wording differs: ${amendment.id}`);
    assert.equal([...new Set(amendment.conditions.map(row => row.text))].join('\n\n'), amendment.text.replaceAll('\r\n', '\n'));
    for (const row of amendment.conditions) {
        assert.ok(!ids.has(row.id)); ids.add(row.id); amendedConditions++;
        if (row.result === '既存バックログ対応') assert.ok(row.backlog && row.note.includes(row.backlog), `Missing transfer reference ${row.id}`);
        if (!['成功', '合否不要', '既存バックログ対応'].includes(row.result)) outstanding.push(row.id);
    }
}
console.log(JSON.stringify({ revision: data.revision, version: data.verificationVersion, sections, descriptions: count, assigned: count, amendedConditions, outstanding: outstanding.length, acceptanceComplete: outstanding.length === 0 }));
if (process.argv.includes('--require-complete')) assert.equal(outstanding.length, 0, 'QA-01 has unresolved verification or owner decisions');
