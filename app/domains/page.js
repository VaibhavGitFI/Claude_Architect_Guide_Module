import { DOMAINS } from "@/lib/constants";
import DomainSidebarNav from "@/components/domains/DomainSidebarNav";
import DomainDeepDive from "@/components/domains/DomainDeepDive";

import d1 from "@/lib/data/domain-deepdive/d1.json";
import d2 from "@/lib/data/domain-deepdive/d2.json";
import d3 from "@/lib/data/domain-deepdive/d3.json";
import d4 from "@/lib/data/domain-deepdive/d4.json";
import d5 from "@/lib/data/domain-deepdive/d5.json";

const DEEP_DIVES = { D1: d1, D2: d2, D3: d3, D4: d4, D5: d5 };

export const metadata = { title: "Domains — Claude Certified Architect" };

export default async function DomainsPage({ searchParams }) {
  const sp = await searchParams;
  const requested = (sp?.domain || "").toUpperCase();
  const domain = DOMAINS.includes(requested) ? requested : "D1";
  const dd = DEEP_DIVES[domain];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <DomainSidebarNav basePath="/domains" activeDomain={domain} deepDives={DEEP_DIVES} />
      <div className="flex-1 min-w-0">
        <DomainDeepDive domain={domain} dd={dd} />
      </div>
    </div>
  );
}
