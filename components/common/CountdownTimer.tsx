"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/cn"; // Checking if utils/cn exists, otherwise I'll use standard className

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate: string | number | Date;
    className?: string;
}

export default function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setIsExpired(true);
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (isExpired) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-semibold animate-pulse">
                <Clock className="w-5 h-5" />
                <span>Event has started!</span>
            </div>
        );
    }

    if (!timeLeft) return null;

    return (
        <div className={className}>
            <div className="flex flex-wrap items-center gap-4">
                {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Mins", value: timeLeft.minutes },
                    { label: "Secs", value: timeLeft.seconds },
                ].map((item, index) => (
                    <div 
                        key={item.label}
                        className="flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 min-w-[70px] shadow-sm transform hover:scale-105 transition-transform"
                    >
                        <span className="text-2xl font-bold text-white drop-shadow-sm">
                            {item.value.toString().padStart(2, "0")}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/70">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
