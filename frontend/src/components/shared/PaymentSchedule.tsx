import { Plus, Trash2, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimePicker } from "./DateTimePicker";

export interface PaymentScheduleItem {
  amount: string;
  deadline: Date | undefined;
}

interface PaymentScheduleProps {
  items: PaymentScheduleItem[];
  onItemsChange: (items: PaymentScheduleItem[]) => void;
  disabled?: boolean;
  className?: string;
}

export function PaymentSchedule({
  items,
  onItemsChange,
  disabled = false,
  className,
}: PaymentScheduleProps) {
  const addPaymentItem = () => {
    onItemsChange([...items, { amount: "", deadline: undefined }]);
  };

  const removePaymentItem = (index: number) => {
    if (items.length > 1) {
      onItemsChange(items.filter((_, i) => i !== index));
    }
  };

  const updatePaymentItem = (
    index: number,
    field: keyof PaymentScheduleItem,
    value: string | Date | undefined
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onItemsChange(updated);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <Label className="flex items-center gap-2 text-base font-medium">
          <DollarSign className="w-4 h-4" />
          Payment Schedule
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPaymentItem}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-end gap-4">
                {/* Payment Number */}
                <div className="flex-shrink-0 pb-1">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                </div>
                
                {/* Payment Details - Takes remaining space */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                  <div className="space-y-1">
                    <Label htmlFor={`amount-${index}`} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      Amount (TlToken)
                    </Label>
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => updatePaymentItem(index, "amount", e.target.value)}
                      disabled={disabled}
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Payment Deadline
                    </Label>
                    <DateTimePicker
                      value={item.deadline}
                      onChange={(date) => updatePaymentItem(index, "deadline", date)}
                      placeholder="Select deadline"
                      disabled={disabled}
                      className="h-9"
                    />
                  </div>
                </div>
                
                {/* Delete Button - Always takes same space */}
                <div className="flex-shrink-0 w-10 flex justify-center">
                  {items.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePaymentItem(index)}
                      disabled={disabled}
                      className="h-9 w-9 p-0 !text-red-600 !border-red-300 hover:!text-white hover:!bg-red-600 hover:!border-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="w-9 h-9" /> 
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
