import { useEffect, useState } from "react";
import { useTonClients } from "./useTonClient";
import { Address,  OpenedContract, toNano } from "ton-core";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { MainContract } from "../contracts/MainContract";
import { useTonConnect } from "./useTonConnect";


export function useMainContract(){
    const client = useTonClients();
    const { sender } = useTonConnect();
    const sleep=(second:number)=>new Promise((resolve)=>setTimeout(resolve,second));
    const [ contactData,setContractData] = useState<null|{
        counter_value: number;
        recent_sender: Address;
        owner_address: Address;
    }>();
    const [ balance , setBalance] = useState<null|number>(0);
    const mainContract = useAsyncInitialize(async ()=>{
        if( !client ) return ;
        const contractAddress = Address.parse("EQAPOGJl3jfDukiScsCRS1-YuzJX4KMKNhgLQQbuy9sE4QSZ");
        const myContract = new MainContract(contractAddress);
        return client.open(myContract) as OpenedContract<MainContract>;
    },[client]);

    useEffect( ()=>{
        async function getDataValue(){
            if(!mainContract) return;
            setContractData(null);
            const val = await mainContract.getData();
            setContractData({
                counter_value:val.number,
                recent_sender:val.recent_sender,
                owner_address:val.owner_address
            });
            const { balance } = await mainContract.getBalance();
            console.log("balance=",balance);
            setBalance(balance);
            await sleep(5000);
            getDataValue();
        }
        getDataValue();
    },[mainContract]);
    return {
        contract_address:mainContract?.address.toString(),
        contract_balance:balance,
        ...contactData,
        sendIncrement:()=>{
            mainContract?.sendIncrement(sender,toNano("0.01"),1);
        },
        sendDispot:(val:number)=>{
            mainContract?.sendDepose(sender,toNano(val));
        },
        sendWithdraw:(amount:number)=>{
            mainContract?.sendWithdrawRequest(sender,toNano("0.01"),toNano(amount));
        }
    };
}