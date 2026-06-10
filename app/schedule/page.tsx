import { redirect } from 'next/navigation';

// The old /schedule page merged calendar + manual posting. Both now have
// dedicated homes: /calendar (planning) and /scheduled-posts (queue + manual
// posting assistant). Keep old links working.
export default function SchedulePage() {
  redirect('/calendar');
}
