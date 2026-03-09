"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SESSION = 25 * 60;

export function PomodoroWidget() {
  const [seconds, setSeconds] = useState(SESSION);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <Card>
      <p className="text-sm font-medium">Focus rapide</p>
      <p className="mt-2 text-3xl font-semibold text-primary">
        {minutes}:{secs}
      </p>
      <div className="mt-3 flex gap-2">
        <Button type="button" onClick={() => setRunning((v) => !v)}>
          {running ? "Pause" : "Demarrer"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setRunning(false);
            setSeconds(SESSION);
          }}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
}


