export interface TradeRow {
  trade_number: number;
  symbol: string;
  instrument: string;
  expiry: string;
  strike_price: number;
  option_type: string;
  script: string;
  member_id: string;
  buy_sell: number; // 1 for Buy, 2 for Sell
  qty: number;
  price: number;
  pro_client: string;
  client_id: string;
  ts1: string;
  ts2: string;
  ts3: string;
  ctcl_no: string;
  code: string;

  buy_qty?: number;
  buy_avg?: number;
  sell_qty?: number;
  sell_avg?: number;
  net_qty?: number;
  realised_pnl?: number;
  ltp_fut?: number;
  tmv?: number;
  unrealised_pnl?: number;
  mtm?: number;
  }