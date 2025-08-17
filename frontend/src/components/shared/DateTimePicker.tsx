"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<string>(
    value ? format(value, "HH:mm:ss") : "10:30:00"
  )

  React.useEffect(() => {
    setDate(value)
    if (value) {
      setTime(format(value, "HH:mm:ss"))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate && time) {
      // Combine date with current time
      const [hours, minutes, seconds] = time.split(':').map(Number)
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes, seconds, 0)
      onChange?.(newDateTime)
    }
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value
    setTime(newTime)
    if (date && newTime) {
      // Combine current date with new time
      const [hours, minutes, seconds] = newTime.split(':').map(Number)
      const newDateTime = new Date(date)
      newDateTime.setHours(hours, minutes, seconds || 0, 0)
      onChange?.(newDateTime)
    }
  }

  const handleDone = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${className}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP 'at' HH:mm:ss") : placeholder}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-auto">
        <DialogHeader>
          <DialogTitle>Select Date & Time</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="dialog-date-picker" className="px-1">
              Date
            </Label>
            <div className="w-auto overflow-hidden p-0">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
                disabled={disabled}
                className="h-74"
                classNames={{
                  day: "h-8 w-8 rounded-md m-1 hover:bg-accent hover:text-accent-foreground",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="dialog-time-picker" className="px-1">
              Time
            </Label>
            <Input
              type="time"
              id="dialog-time-picker"
              step="1"
              value={time}
              onChange={handleTimeChange}
              disabled={disabled}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleDone}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
