import { DOMAINS } from "@/lib/constants";
import StudySidebarNav from "@/components/study/StudySidebarNav";
import StudyOverview from "@/components/study/StudyOverview";
import TopicView from "@/components/study/TopicView";

import d1 from "@/lib/data/study-content/d1.json";
import d2 from "@/lib/data/study-content/d2.json";
import d3 from "@/lib/data/study-content/d3.json";
import d4 from "@/lib/data/study-content/d4.json";
import d5 from "@/lib/data/study-content/d5.json";

const STUDY_CONTENTS = { D1: d1, D2: d2, D3: d3, D4: d4, D5: d5 };

export const metadata = { title: "Study Guide — Claude Certified Architect" };

export default async function StudyPage({ searchParams }) {
  const sp = await searchParams;
  const requested = (sp?.domain || "").toUpperCase();
  const domain = DOMAINS.includes(requested) ? requested : "D1";
  const sc = STUDY_CONTENTS[domain];
  const topicId = sp?.topic || null;
  const topic = topicId ? sc.topics.find((t) => t.id === topicId) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <StudySidebarNav activeDomain={domain} activeTopic={topic ? topicId : null} studyContents={STUDY_CONTENTS} />
      <div className="flex-1 min-w-0">{topic ? <TopicView topic={topic} /> : <StudyOverview sc={sc} />}</div>
    </div>
  );
}
