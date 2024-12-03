import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { fromNano } from "ton-core";

function App() {
  const {
    contract_address,
    counter_value,
    //recent_sender,
    //owner_address,
    contract_balance,
    sendIncrement,
    sendDispot,
    sendWithdraw
   
  } = useMainContract();
  const { connected } = useTonConnect();
  const calcStoreFee = ()=>{
    const bit_price=1;
    const cell_price_ps=500;
    const size = 1024*1024*8;
    const time_delta = 3600*24*365;
    const cell_count = Math.floor(size/1023);
    const storage_fee = (cell_count * cell_price_ps + size * bit_price)
    / 2**16 * time_delta;
    return storage_fee;
  };
  const g_fee = calcStoreFee();
  return (
    <div>
      <div>
        <TonConnectButton />
      </div>
      <div>
        <div className='Card'>
          <b>Our contract Address</b>
          <div className='Hint'>{contract_address?.slice(0, 30) + "..."}</div>
          <b>Our contract Balance</b>
          <div className='Hint'>{ fromNano(contract_balance ??"0")}</div>
        </div>

        <div className='Card'>
          <b>Counter Value</b>
          <div>{counter_value ?? "Loading..."}</div>
        </div>

        <div className='Card'>
          { connected && (
              <a onClick={()=>{sendIncrement();}}>
                increment by 1
              </a>
          )}
        </div>
        <div className="Card">
          { connected && (
            <a onClick={()=>{sendWithdraw(0.01);}}>
              withdraw 0.01
            </a>
          ) }
        </div>
        <div className="Card">
          {
            connected && (
            <a onClick={()=>{sendDispot(0.01);}}>
              charge 0.01 {g_fee}
            </a>
          ) }
        </div>
      </div>
    </div>
  );
}

export default App;