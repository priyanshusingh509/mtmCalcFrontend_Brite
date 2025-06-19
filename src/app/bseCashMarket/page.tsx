'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';

export default function bseCashMarketPage(){
    return(
      <div>
        <Header/>
        <div className="flex h-[80vh] flex-col w-full">
          <TradeGrid />
        </div>
      </div>
    )
}