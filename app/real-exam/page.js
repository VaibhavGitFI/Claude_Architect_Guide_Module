"use client";

import { useRouter } from "next/navigation";
import TimedExamRunner from "@/components/exam/TimedExamRunner";
import { REAL_EXAM_PASS_MARK } from "@/lib/constants";

export default function RealExamPage() {
  const router = useRouter();
  return (
    <TimedExamRunner
      mode="real"
      title="Real Exam Simulation"
      lead={`Full-length exam under real conditions: 60 questions in 120 minutes, real weighting (27/18/20/20/15), shuffled options, no repeats within your seen pool, single results screen at the end. Pass mark ${Math.round(REAL_EXAM_PASS_MARK * 100)}%.`}
      defaults={{ count: 60, time: 120, source: "all" }}
      countOptions={[40, 60, 80, 100]}
      timeOptions={[60, 90, 120, 0]}
      showSourceFilter={false}
      passMark={REAL_EXAM_PASS_MARK}
      onBackToDashboard={() => router.push("/")}
    />
  );
}
