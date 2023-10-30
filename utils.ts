import type {Chart} from "./types";

const printChart = (chart: Chart, start = 0): void => {
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

export {printChart};
