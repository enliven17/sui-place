import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, CANVAS_OBJECT_ID } from './constants';

// System Clock object ID on Sui
const CLOCK_OBJECT_ID = '0x6';

export function createDrawTransaction(
    x: number,
    y: number,
    color: number
): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${PACKAGE_ID}::canvas::draw`,
        arguments: [
            tx.object(CANVAS_OBJECT_ID),
            tx.object(CLOCK_OBJECT_ID),
            tx.pure.u64(x),
            tx.pure.u64(y),
            tx.pure.u8(color),
        ],
    });

    return tx;
}
