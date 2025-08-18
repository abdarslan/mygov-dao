import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToken } from "@/hooks/useToken";
import { useAccount } from "wagmi";
import { Loader2, Send, Coins } from "lucide-react";
import deploymentInfo from "@/contract-data/deployment-info.json";
import { TokenBalance, TokenFaucet, TransferForm, DonationForm } from "@/components/token";

const TokenPage: React.FC = () => {
    const { isConnected, address } = useAccount();
    const {
        // MyGov Token data
        myGovBalance,
        myGovTokenName,
        myGovTokenSymbol,
        myGovTotalSupply,
        
        // TL Token data
        tlTokenBalance,
        tlTokenSymbol,
        
        // States
        isLoading,
        isPending,
        isConfirming,
        error,
        lastActionMessage,
        
        // Actions
        faucet,
        transfer,
        sendMyGovToken,
        mintTlToken,
        donateMyGovToken,
        donateTLToken,
        resetMessages,
    } = useToken();

    // Admin functions state
    const [sendToAddress, setSendToAddress] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [mintToAddress, setMintToAddress] = useState('');
    const [mintAmount, setMintAmount] = useState('');

    const handleFaucet = async () => {
        await faucet();
    };

    const handleTransfer = async (transferTo: string, transferAmount: string) => {
        await transfer(transferTo, transferAmount);
    };

    const handleSendMyGovToken = async () => {
        if (!sendToAddress || !sendAmount) return;
        await sendMyGovToken(sendToAddress, sendAmount);
        setSendToAddress('');
        setSendAmount('');
    };

    const handleMintTlToken = async () => {
        if (!mintToAddress || !mintAmount) return;
        await mintTlToken(mintToAddress, mintAmount);
        setMintToAddress('');
        setMintAmount('');
    };

    const handleDonateMyGov = async (amount: string) => {
        await donateMyGovToken(amount);
    };

    const handleDonateTL = async (amount: string) => {
        await donateTLToken(amount);
    };

    // Check if connected account is the deployer
    const isDeployer = address?.toLowerCase() === deploymentInfo.deployer.toLowerCase();

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Tokens</h2>
                <p className="text-gray-600">Manage your DAO tokens and rewards</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-4 rounded-lg bg-red-100/80 border border-red-200 text-red-700 backdrop-blur-sm">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                    <Button 
                        onClick={resetMessages}
                        className="mt-2 text-xs bg-red-200 hover:bg-red-300 text-red-800"
                        size="sm"
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            {lastActionMessage && (
                <div className="p-4 rounded-lg bg-green-100/80 border border-green-200 text-green-700 backdrop-blur-sm">
                    <p className="font-medium">Success</p>
                    <p className="text-sm">{lastActionMessage}</p>
                    <Button 
                        onClick={resetMessages}
                        className="mt-2 text-xs bg-green-200 hover:bg-green-300 text-green-800"
                        size="sm"
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Token Balance */}
                <TokenBalance
                    myGovBalance={myGovBalance?.toString() || "0"}
                    myGovSymbol={myGovTokenSymbol}
                    tlTokenBalance={tlTokenBalance?.toString() || "0"}
                    tlTokenSymbol={tlTokenSymbol}
                    isLoading={isLoading}
                />

                {/* Faucet */}
                <TokenFaucet
                    tokenSymbol={myGovTokenSymbol}
                    onFaucet={handleFaucet}
                    isLoading={isLoading}
                    isPending={isPending}
                    isConfirming={isConfirming}
                    isConnected={isConnected}
                />

                {/* Token Info */}
                <Card className="backdrop-blur-sm bg-white/20 border-white/30">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            🪙 Token Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-semibold text-gray-800">{myGovTokenName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Symbol</p>
                                <p className="font-semibold text-gray-800">{myGovTokenSymbol}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Supply</p>
                                <p className="font-semibold text-gray-800">{myGovTotalSupply}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Donation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donate MyGov Tokens */}
                <DonationForm
                    tokenSymbol={myGovTokenSymbol}
                    tokenBalance={myGovBalance?.toString() || "0"}
                    tokenIcon="💝"
                    onDonate={handleDonateMyGov}
                    isLoading={isLoading}
                    isPending={isPending}
                    isConfirming={isConfirming}
                    isConnected={isConnected}
                    color="purple"
                    step="1"
                />

                {/* Donate TL Tokens */}
                <DonationForm
                    tokenSymbol={tlTokenSymbol}
                    tokenBalance={tlTokenBalance?.toString() || "0"}
                    tokenIcon="🎁"
                    onDonate={handleDonateTL}
                    isLoading={isLoading}
                    isPending={isPending}
                    isConfirming={isConfirming}
                    isConnected={isConnected}
                    color="indigo"
                    step="0.000000000000000001"
                />
            </div>

            {/* Transfer Section */}
            <TransferForm
                onTransfer={handleTransfer}
                isLoading={isLoading}
                isPending={isPending}
                isConfirming={isConfirming}
                isConnected={isConnected}
            />

            {/* Admin Functions - Only show for deployer */}
            {isDeployer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Send MyGov Tokens (Owner) */}
                <Card className="backdrop-blur-sm bg-white/20 border-white/30">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-orange-600 flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Send {myGovTokenSymbol} (Owner)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="sendToAddress" className="text-sm font-medium text-gray-700">
                                    Recipient Address
                                </Label>
                                <Input
                                    id="sendToAddress"
                                    type="text"
                                    value={sendToAddress}
                                    onChange={(e) => setSendToAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="backdrop-blur-sm bg-white/40 border-white/60 focus:border-orange-400 focus:ring-orange-400/20"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="sendAmount" className="text-sm font-medium text-gray-700">
                                    Amount
                                </Label>
                                <Input
                                    id="sendAmount"
                                    type="number"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                    placeholder="0"
                                    className="backdrop-blur-sm bg-white/40 border-white/60 focus:border-orange-400 focus:ring-orange-400/20"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button 
                                onClick={handleSendMyGovToken}
                                disabled={!isConnected || !sendToAddress || !sendAmount || isLoading || isPending || isConfirming}
                                className="w-full backdrop-blur-sm bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-600/90 hover:to-red-700/90 text-white border border-orange-400/30 shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                {isPending || isConfirming ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {isPending ? 'Confirming...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Send {myGovTokenSymbol}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Mint TL Tokens (Owner) */}
                <Card className="backdrop-blur-sm bg-white/20 border-white/30">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-green-600 flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            Mint {tlTokenSymbol} (Owner)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="mintToAddress" className="text-sm font-medium text-gray-700">
                                    Recipient Address
                                </Label>
                                <Input
                                    id="mintToAddress"
                                    type="text"
                                    value={mintToAddress}
                                    onChange={(e) => setMintToAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="backdrop-blur-sm bg-white/40 border-white/60 focus:border-green-400 focus:ring-green-400/20"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="mintAmount" className="text-sm font-medium text-gray-700">
                                    Amount (in TL)
                                </Label>
                                <Input
                                    id="mintAmount"
                                    type="number"
                                    value={mintAmount}
                                    onChange={(e) => setMintAmount(e.target.value)}
                                    placeholder="0"
                                    className="backdrop-blur-sm bg-white/40 border-white/60 focus:border-green-400 focus:ring-green-400/20"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button 
                                onClick={handleMintTlToken}
                                disabled={!isConnected || !mintToAddress || !mintAmount || isLoading || isPending || isConfirming}
                                className="w-full backdrop-blur-sm bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-700/90 text-white border border-green-400/30 shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                {isPending || isConfirming ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {isPending ? 'Confirming...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <Coins className="h-4 w-4 mr-2" />
                                        Mint {tlTokenSymbol}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            )}

            {/* Transaction History */}
            <Card className="backdrop-blur-sm bg-white/20 border-white/30">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        📋 Recent Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {isConnected ? (
                            <div className="text-center text-gray-600 py-8">
                                <p>Transaction history will be available in a future update</p>
                                <p className="text-sm mt-2">
                                    For now, you can check your transactions on the blockchain explorer
                                </p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 py-8">
                                <p>Connect your wallet to view transaction history</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TokenPage;
