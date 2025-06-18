
import TradeGrid from './components/TradeGrid';

// import dotenv from 'dotenv';
// dotenv.config();
export default function TradePage() {
  // console.log(process.env.BACKEND_IP);
  return (
    <div className="flex flex-col h-screen w-full">
      <TradeGrid />
    </div>
  );
}
