'use client';
import Header from '../components/header';
import TradeGrid from '../components/TradeGrid';

export default function bseCashMarketPage(){
    return(
      <div>
        <Header/>
        <div className="flex flex-col h-screen w-full">
          <TradeGrid />
        </div>
      </div>
    )
}