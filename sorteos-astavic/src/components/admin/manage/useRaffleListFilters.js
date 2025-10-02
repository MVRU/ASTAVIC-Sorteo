// src/components/admin/manage/useRaffleListFilters.js

import { useMemo } from "react";

const SORTERS = {
  date_asc: (a, b) => new Date(a.datetime) - new Date(b.datetime),
  date_desc: (a, b) => new Date(b.datetime) - new Date(a.datetime),
  title_asc: (a, b) => (a.title || "").localeCompare(b.title || ""),
};

export const useRaffleListFilters = ({ raffles, tab, query, sort }) =>
  useMemo(() => {
    const active = raffles.filter((raffle) => !raffle.finished);
    const finished = raffles.filter((raffle) => raffle.finished);

    const stats = {
      activeCount: active.length,
      finishedCount: finished.length,
    };

    const baseList = tab === "finished" ? finished : active;
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = !normalizedQuery
      ? baseList
      : baseList.filter((raffle) => {
          const haystack = `${raffle.title || ""} ${
            raffle.description || ""
          }`.toLowerCase();
          return haystack.includes(normalizedQuery);
        });

    const sorter = SORTERS[sort] || SORTERS.date_desc;
    const sorted = [...filtered].sort(sorter);

    return { list: sorted, stats };
  }, [raffles, tab, query, sort]);

export default useRaffleListFilters;
