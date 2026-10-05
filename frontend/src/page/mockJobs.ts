// mockJobs.ts
export const allJobs = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  title: `Fake Job ${i + 1}`,
  location: "Pasig City",
}));

export const fakeFetchJobs = (page: number, perPage = 10) => {
  return new Promise<{ data: typeof allJobs; nextPage: number | null }>((resolve) => {
    setTimeout(() => { // simulate network delay
      const start = (page - 1) * perPage;
      const pageData = allJobs.slice(start, start + perPage);
      const hasMore = start + perPage < allJobs.length;
      resolve({ data: pageData, nextPage: hasMore ? page + 1 : null });
    }, 1000);
  });
};