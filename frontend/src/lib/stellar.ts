import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_HORIZON_URL, STELLAR_CANVAS_CONTRACT, STELLAR_GAME_HUB_CONTRACT } from './constants';

const server = new StellarSdk.Horizon.Server(STELLAR_HORIZON_URL);

export async function createStellarDrawTransaction(
    sourceAddress: string,
    x: number,
    y: number,
    color: number
): Promise<StellarSdk.Transaction> {
    const account = await server.loadAccount(sourceAddress);
    
    const contract = new StellarSdk.Contract(STELLAR_CANVAS_CONTRACT);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
        .addOperation(
            contract.call(
                'draw',
                StellarSdk.nativeToScVal(x, { type: 'u64' }),
                StellarSdk.nativeToScVal(y, { type: 'u64' }),
                StellarSdk.nativeToScVal(color, { type: 'u32' })
            )
        )
        .setTimeout(30)
        .build();
    
    return transaction;
}

export async function callGameHubStartGame(
    sourceAddress: string,
    gameId: string
): Promise<StellarSdk.Transaction> {
    const account = await server.loadAccount(sourceAddress);
    
    const contract = new StellarSdk.Contract(STELLAR_GAME_HUB_CONTRACT);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
        .addOperation(
            contract.call(
                'start_game',
                StellarSdk.nativeToScVal(gameId, { type: 'string' })
            )
        )
        .setTimeout(30)
        .build();
    
    return transaction;
}

export async function callGameHubEndGame(
    sourceAddress: string,
    gameId: string
): Promise<StellarSdk.Transaction> {
    const account = await server.loadAccount(sourceAddress);
    
    const contract = new StellarSdk.Contract(STELLAR_GAME_HUB_CONTRACT);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
        .addOperation(
            contract.call(
                'end_game',
                StellarSdk.nativeToScVal(gameId, { type: 'string' })
            )
        )
        .setTimeout(30)
        .build();
    
    return transaction;
}
