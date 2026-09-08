"use client"

import {
    DateSelector,
    type DateSelectorValue,
} from '@/components/ui/date-selector';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react'

export default function StaticFields() {
    const [date, setDate] = useState<DateSelectorValue>({
        period: "day" as const,
        operator: "is" as const,
        startDate: new Date(),
    });
    const [notes, setNotes] = useState('')
    return (
        <div className='flex flex-col gap-4'>

            <DateSelector
                value={date}
                onChange={setDate}
                className=''
            />

            <Textarea maxLength={20} placeholder="Type your message here." onChange={(e) => { setNotes(e.target.value) }} />
        </div>
    )
}