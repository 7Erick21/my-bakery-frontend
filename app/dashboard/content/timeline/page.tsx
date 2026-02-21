import { getAllLanguagesAdmin, getAllTimelineEventsAdmin } from '@/server/queries/landing';
import { TimelineEditor } from '@/views/Dashboard/Content';

export default async function TimelinePage() {
  const [events, languages] = await Promise.all([
    getAllTimelineEventsAdmin(),
    getAllLanguagesAdmin()
  ]);

  const langOptions = languages.map(l => ({ code: l.code, name: l.name }));

  return <TimelineEditor events={events} languages={langOptions} />;
}
