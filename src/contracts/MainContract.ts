import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from "ton-core";

export type MainContractConfig={
    number:number;
    address:Address;
    owner_address:Address;
}
export function mainContractConfigToCell( config: MainContractConfig):Cell{
    return beginCell().storeInt(config.number,32)
        .storeAddress(config.address)
        .storeAddress(config.owner_address)
        .endCell();
}
export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) { }

    static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);

        return new MainContract(address, init);
    }
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
          value,
          sendMode: SendMode.PAY_GAS_SEPARATELY,
          body: beginCell().endCell(),
        });
    }
    async sendIncrement(provide:ContractProvider,
        sender:Sender,
        value:bigint,
        increment_by:number
    ) {
        const msg_body = beginCell().storeInt(1,32).storeInt(increment_by,32).endCell();
        await provide.internal(sender,{
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body:msg_body,
        });
    }
    async sendDepose(
        provide:ContractProvider,
        sender:Sender,
        value : bigint
    ){
        // eslint-disable-next-line prefer-const
        let msg_body=beginCell().storeInt(2,32).endCell();
        await provide.internal( sender,{
            value,
            sendMode:SendMode.PAY_GAS_SEPARATELY,
            body:msg_body
        });
    }
    async sendNoOpererCodeDepose(
        provide:ContractProvider,
        sender:Sender,
        value : bigint
    ){
        await provide.internal( sender,{
            value,
            sendMode:SendMode.PAY_GAS_SEPARATELY,
            body:beginCell().endCell()
        });
    }
    async sendWithdrawRequest(
        provide:ContractProvider,
        sender:Sender,
        value : bigint,
        amount: bigint
    ){
        const in_msg_body = beginCell().storeInt(3,32).storeCoins(amount).endCell();
        await provide.internal( sender,{
            value,
            sendMode:SendMode.PAY_GAS_SEPARATELY,
            body:in_msg_body
        });
    }
    async sendInternalMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
    async getData(provider: ContractProvider) {
        const { stack } = await provider.get("get_contract_storage_data", []);
        return {
            number : stack.readNumber(),
            recent_sender: stack.readAddress(),
            owner_address:stack.readAddress()
        };
    }
    async getBalance( provider : ContractProvider ){
        const { stack } = await provider.get("balance", []);
        return {
            balance : stack.readNumber()
        };
    }
}