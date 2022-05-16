// @ts-ignore
const printTree = require("print-tree");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const Nonterminals = ["S", "NP", "VP", "N", "V", "PP", "P"];

const nouns = ["can", "fish", "rivers", "they", "december"];
const prepositions = ["in"];
const verbs = ["can", "fish"];

const Terminals: {[key: string]: string[]} = {
  N: nouns,
  V: verbs,
  P: prepositions,
};

type Rule = {
  head: string;
  body: string[];
};

const rules: Rule[] = [
  // S -> NP VP ; starting rule
  {head: "S", body: ["NP", "VP"]},
  // NP -> N PP
  {head: "NP", body: ["N", "PP"]},
  // NP -> N
  {head: "NP", body: ["N"]},
  // PP -> P NP
  {head: "PP", body: ["P", "NP"]},
  // VP -> VP PP
  {head: "VP", body: ["VP", "PP"]},
  // VP -> V VP
  {head: "VP", body: ["V", "VP"]},
  // VP -> V NP
  {head: "VP", body: ["V", "NP"]},
  // VP -> V
  {head: "VP", body: ["V"]},
];

type Edge = {
  id: number;
  rule: Rule;
  dot: number;
  start: number;
  end: number;
  history?: number[];
};

const log_chart = (chart: Edge[], start = 0): void => {
  for (let i = start; i < chart.length; i++) {
    const edge = chart[i];
    const head = edge.rule.head;
    let body = "";
    for (let i = 0; i < edge.rule.body.length; i++) {
      if (edge.dot === i) {
        body += ".";
      }
      body += edge.rule.body[i];
      body += " ";
    }
    if (edge.dot === edge.rule.body.length) {
      body += ".";
    }

    console.log(
      `${edge.id}: ${head} -> ${body} \t\t [${edge.start}, ${edge.end}] \t\t ${edge.history ?? ""
      }`
    );
  }
};

const predict = (input: string[], chart: Edge[], pos: number): number => {
  const chartLengthTmp = chart.length;
  let maxId = chart[chart.length - 1].id;
  let edgesAddedCount = 0;
  const expandedNTs: string[] = [];
  for (let i = chartLengthTmp - pos; i < chartLengthTmp; i++) {
    const edge = chart[i];
    if (edge.dot >= edge.rule.body.length) {
      // dot at end of rule
      continue;
    }
    const symbolAfterDot = edge.rule.body[edge.dot];
    if (expandedNTs.includes(symbolAfterDot)) {
      continue;
    }
    expandedNTs.push(symbolAfterDot);
    const rulesToAdd = rules.filter((r) => r.head === symbolAfterDot);
    for (const r of rulesToAdd) {
      maxId++;
      chart.push({
        id: maxId,
        rule: r,
        dot: 0,
        start: edge.end,
        end: edge.end,
      });
      edgesAddedCount++;
    }
  }
  console.log("--- predict");
  log_chart(chart, chartLengthTmp);
  // return pos + edgesAddedCount;
  return edgesAddedCount;
};

const scan = (input: string[], chart: Edge[], pos: number): number => {
  const chartLengthTmp = chart.length;
  let maxId = chart[chart.length - 1].id;
  const expandedNTs: string[] = [];
  let edgesAddedCount = 0;
  for (let i = chartLengthTmp - pos; i < chartLengthTmp; i++) {
    const edge = chart[i];
    const nextSymbol = edge.rule.body[edge.dot];
    const nextInput = input[edge.start];
    if (expandedNTs.includes(nextSymbol)) {
      continue;
    }
    if (Terminals[nextSymbol] != undefined) {
      expandedNTs.push(nextSymbol);
      // scan next input to see if it matches next nonterminal
      if (Terminals[nextSymbol].includes(nextInput)) {
        maxId++;
        chart.push({
          id: maxId,
          rule: {head: nextSymbol, body: [nextInput]},
          dot: 1,
          start: edge.start,
          end: edge.end + 1,
        });
        edgesAddedCount++;
      }
    }
  }
  console.log("--- scan");
  log_chart(chart, chartLengthTmp);
  // return pos + edgesAddedCount;
  return edgesAddedCount;
};

const complete = (input: string[], chart: Edge[], pos: number): number => {
  const chartLengthTmp = chart.length;
  let maxId = chart[chart.length - 1].id;
  let edgesAddedCount = 0;
  for (let i = chart.length - pos; i < chart.length; i++) {
    const edge = chart[i];
    if (edge.dot === edge.rule.body.length) {
      // completed rule; propagate
      const head = edge.rule.head;
      // check all previous rule bodies
      for (let j = 0; j < i; j++) {
        const r = chart[j].rule;
        const dot = chart[j].dot;
        if (r.body.findIndex((x) => x === head) === dot && chart[j].end === edge.start) {
          // check if we haven't completed this same rule already
          const alreadyCompleted = false;
          // for (const e of chart) {
          //   if (
          //     e.rule.head === r.head &&
          //     JSON.stringify(e.rule.body) === JSON.stringify(r.body) &&
          //     e.dot === dot + 1 &&
          //     e.start === chart[j].start &&
          //     e.end === edge.end
          //   ) {
          //     alreadyCompleted = true;
          //   }
          // }
          if (!alreadyCompleted) {
            // complete rule
            maxId++;
            chart.push({
              id: maxId,
              rule: r,
              dot: dot + 1,
              start: chart[j].start,
              end: edge.end,
              history: [edge.id, chart[j].id],
            });
            edgesAddedCount++;
          }
        }
      }
    }
  }
  console.log("--- complete");
  log_chart(chart, chartLengthTmp);
  return edgesAddedCount;
};

const checkDone = (input: string[], chart: Edge[], pos: number): boolean => {
  for (let i = pos; i < chart.length; i++) {
    const edge = chart[i];
    if (
      edge.rule.head === "S" &&
      edge.dot === edge.rule.body.length &&
      edge.start === 0 &&
      edge.end === input.length
    ) {
      console.log("---");
      console.log(`Done: ${edge.id}`);
      return true;
    }
  }
  return false;
};

const checkSolutions = (input: string[], chart: Edge[]): number[] => {
  const ids: number[] = [];
  for (let i = 0; i < chart.length; i++) {
    const edge = chart[i];
    if (
      edge.rule.head === "S" &&
      edge.dot === edge.rule.body.length &&
      edge.start === 0 &&
      edge.end === input.length
    ) {
      ids.push(edge.id);
    }
  }
  return ids;
};

const traceHistory = (input: string[], chart: Edge[], startId: number) => {
  const edge = chart.find((e) => e.id === startId);
  if (!edge) return {};

  const edgeHistory = edge.history ?? [];

  const historyTree = {
    edge:
      edge.rule.head +
      (Nonterminals.includes(edge.rule.body[0]) ? "" : " " + edge.rule.body[0]),
    history: [],
  };

  if (edgeHistory.length === 0) return historyTree;

  // @ts-ignore
  historyTree.history.push(traceHistory(input, chart, edgeHistory[0]));

  const prevVersionOfRule = edgeHistory[1];
  const prevEdge = chart.find((e) => e.id === prevVersionOfRule);

  if (!prevEdge) return historyTree;

  if (prevEdge.history && prevEdge.history.length === 2) {
    // @ts-ignore
    historyTree.history.push(traceHistory(input, chart, prevEdge.history[0]));
  } else {
    // console.log(prevEdge.rule);
    // // @ts-ignore
    // historyTree.history.push({ edge: prevEdge.rule.body, history: [] });
  }

  return historyTree;

  // if (!edge) return "";
  // const historyId = edge.history ?? null;
  // if (historyId) {
  //   const history = traceHistory(input, chart, historyId);
  //   return `${startId} -> ${history}`;
  // } else {
  //   return `${startId}`;
  // }
};

const printHistory = (input: string[], chart: Edge[], startId: number) => {
  const tree = traceHistory(input, chart, startId);
  printTree(
    tree,
    // @ts-ignore
    (node) => node.edge,
    // @ts-ignore
    (node) => node.history
  );
};

const parse = (input: string[]) => {
  const chart = [{id: 0, rule: rules[0], dot: 0, start: 0, end: 0}];

  let pos = 1;

  // let numParses = 0;

  log_chart(chart, 0);

  while (true) {
    const pos_tmp = pos;
    pos = predict(input, chart, pos);
    pos = scan(input, chart, pos);
    pos = complete(input, chart, pos);
    if (chart.length >= 500 || pos_tmp === pos) break;
    // const done = checkDone(input, chart, pos);
    // if (done) numParses++;
  }

  const solns = checkSolutions(input, chart);

  console.log(`Num parses: ${solns.length}`);
  console.log(solns);

  for (const soln of solns) {
    console.log("---");
    printHistory(input, chart, soln);
  }

  // console.log(traceHistory(input, chart, solns[0]));
};

// const input = ["they", "can", "fish", "in", "rivers", "in", "december"];

readline.question("Sentence to parse: ", (sentence: string) => {
  const words = sentence.toLowerCase().split(" ");
  readline.close();
  parse(words);
});
