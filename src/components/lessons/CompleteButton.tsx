"use client";

import { useState, useTransition } from "react";
import { setLessonCompleted } from "@/app/(app)/aulas/actions";
import { buttonClasses } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";

type CompleteButtonProps = {
  lessonId: string;
  completed: boolean;
  path: string;
};

export function CompleteButton({
  lessonId,
  completed,
  path,
}: CompleteButtonProps) {
  const [done, setDone] = useState(completed);
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-pressed={done}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const next = !done;
            const { ok } = await setLessonCompleted({
              lessonId,
              completed: next,
              path,
            });
            setFailed(!ok);
            if (ok) setDone(next);
          })
        }
        className={buttonClasses(done ? "secondary" : "primary")}
      >
        {done && <IconCheck className="size-5 text-success" />}
        {done ? "Aula concluída" : "Marcar como concluída"}
      </button>
      {failed && (
        <span role="alert" className="text-sm text-danger">
          Não foi possível salvar. Tente de novo.
        </span>
      )}
    </div>
  );
}
