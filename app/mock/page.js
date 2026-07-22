"use client";

import { useRouter } from "next/navigation";
import TimedExamRunner from "@/components/exam/TimedExamRunner";

export default function MockExamPage() {
  const router = useRouter();
  return (
    <TimedExamRunner
      mode="mock"
      title="Mock Exam"
      lead="A weighted, timed cross-domain mock. Questions are drawn by domain weight (27/18/20/20/15), shuffled, and don't repeat within your seen pool. Per-domain breakdown at the end."
      defaults={{ count: 40, time: 60, source: "all" }}
      countOptions={[20, 40, 60]}
      timeOptions={[30, 60, 90, 0]}
      showSourceFilter
      passMark={null}
      onBackToDashboard={() => router.push("/")}
    />
  );
}
