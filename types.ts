type Nonterminal = string;
type Terminal = string;
type Symb = Nonterminal | Terminal;

type ProductionRule = {
  head: Nonterminal;
  body: Symb[];
};

type Grammar = {
  terminals: Terminal[];
  nonterminals: Nonterminal[];
  startSymbol: Nonterminal;
  productions: ProductionRule[];
}

type EdgeId = number;

type Edge = {
  id: EdgeId;
  rule: ProductionRule;
  dot: number;
  start: number;
  end: number;
  history?: EdgeId[];
};

type Chart = Edge[];

export type {ProductionRule, Edge, Chart, Nonterminal, Terminal, Symb, Grammar};
