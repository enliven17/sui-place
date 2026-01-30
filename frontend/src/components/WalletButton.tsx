'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export default function WalletButton() {
    const account = useCurrentAccount();

    return (
        <div className="flex items-center gap-2">
            {account && (
                <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
            )}
            <ConnectButton
                connectText="Connect Wallet"
                className="!bg-blue-600 !hover:bg-blue-700 !text-white !px-4 !py-2 !rounded-lg !font-medium !transition-colors"
            />
        </div>
    );
}
