const JOB_PREFIX_REGEX = /^job/i;

/** "Job32" -> "32" (ids without the prefix are returned unchanged) */
export const stripJobPrefix = (id: string): string =>
  id.replace(JOB_PREFIX_REGEX, "");

/** "32" -> "Job32" (no-op if the prefix is already there) */
export const withJobPrefix = (id: string): string =>
  JOB_PREFIX_REGEX.test(id) ? id : `Job${id}`;

/** Read the selected job id from the URL, without the prefix */
export const getSelectedJobId = (params: URLSearchParams): string | null => {
  const raw = params.get("job");
  return raw ? stripJobPrefix(raw) : null;
};