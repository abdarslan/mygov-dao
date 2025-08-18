import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Loader2 } from "lucide-react";

interface TokenFaucetProps {
  tokenSymbol: string;
  onFaucet: () => Promise<void>;
  isLoading?: boolean;
  isPending?: boolean;
  isConfirming?: boolean;
  isConnected?: boolean;
  className?: string;
}

export function TokenFaucet({
  tokenSymbol,
  onFaucet,
  isLoading = false,
  isPending = false,
  isConfirming = false,
  isConnected = false,
  className = "",
}: TokenFaucetProps) {
  const isDisabled = !isConnected || isLoading || isPending || isConfirming;

  return (
    <Card className={`backdrop-blur-sm bg-white/20 border-white/30 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Token Faucet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Get free {tokenSymbol} tokens for testing
          </p>
          <Button 
            onClick={onFaucet}
            disabled={isDisabled}
            className="w-full backdrop-blur-sm bg-blue-500/80 hover:bg-blue-600/90 text-white border border-blue-400/30 shadow-lg transition-all duration-300 hover:scale-105"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isPending ? "Confirming..." : "Processing..."}
              </>
            ) : (
              <>
                <Droplets className="h-4 w-4 mr-2" />
                Request Tokens
              </>
            )}
          </Button>
          {!isConnected && (
            <p className="text-xs text-gray-500 mt-2">
              Connect your wallet to use faucet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
