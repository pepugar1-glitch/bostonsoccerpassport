// Thin analytics wrapper. Real SDK wiring deferred.
// TODO(integration: PostHog/Mixpanel): replace console.log path with real SDK call
//   - posthog.capture(event, props) / mixpanel.track(event, props)
//   - capture distinct_id from localStorage 'bsp.distinctId' (set on first visit)

export const track = (event: string, props?: Record<string, unknown>) => {
  if (import.meta.env.DEV) console.log('[analytics]', event, props);
  // TODO(integration: PostHog/Mixpanel): replace with real SDK call
};

let _distinctId: string | null = null;
export function distinctId(): string {
  if (_distinctId) return _distinctId;
  if (typeof window === 'undefined') return 'anon';
  const KEY = 'bsp.distinctId';
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = `bsp_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    window.localStorage.setItem(KEY, id);
  }
  _distinctId = id;
  return id;
}
