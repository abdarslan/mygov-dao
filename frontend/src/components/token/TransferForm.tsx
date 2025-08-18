import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";

interface TransferFormProps {
  onTransfer: (to: string, amount: string) => Promise<void>;
  isLoading?: boolean;
  isPending?: boolean;
  isConfirming?: boolean;
  isConnected?: boolean;
  className?: string;
}

export function TransferForm({
  onTransfer,
  isLoading = false,
  isPending = false,
  isConfirming = false,
  isConnected = false,
  className = "",
}: TransferFormProps) {
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const handleSubmit = async () => {
    if (!transferTo || !transferAmount) return;
    await onTransfer(transferTo, transferAmount);
    setTransferTo("");
    setTransferAmount("");
  };

  const isDisabled = !isConnected || !transferTo || !transferAmount || isLoading || isPending || isConfirming;

  return (
    <Card className={`backdrop-blur-sm bg-white/20 border-white/30 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Send className="h-5 w-5" />
          Transfer Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transferTo" className="text-sm font-medium text-gray-700">
              Recipient Address
            </Label>
            <Input
              id="transferTo"
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="0x..."
              className="backdrop-blur-sm bg-white/40 border-white/60 focus:border-blue-400 focus:ring-blue-400/20"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transferAmount" className="text-sm font-medium text-gray-700">
              Amount
            </Label>
            <Input
              id="transferAmount"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0"
              className="backdrop-blur-sm bg-white/40 border-white/60 focus:border-blue-400 focus:ring-blue-400/20"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={isDisabled}
          className="mt-4 w-full backdrop-blur-sm bg-gradient-to-r from-purple-500/80 to-pink-600/80 hover:from-purple-600/90 hover:to-pink-700/90 text-white border border-purple-400/30 shadow-lg transition-all duration-300 hover:scale-105"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isPending ? "Confirming..." : "Processing..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Transfer Tokens
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
