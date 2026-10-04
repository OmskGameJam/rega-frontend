import { onScopeDispose, watch, type Ref } from 'vue'
import { useCursorContext } from 'win-55-ui-vue'

/** Track a loading flag without leaving the global cursor active after navigation. */
export function useCursorActivity(active: Ref<boolean>, mode: 'busy' | 'progress') {
  const cursor = useCursorContext()
  if (!cursor) return

  let finish: (() => void) | undefined
  watch(active, value => {
    finish?.()
    finish = undefined
    if (!value) return

    // Only resolve this signal: rejected requests are handled by their caller.
    const activity = new Promise<void>(resolve => { finish = resolve })
    if (mode === 'busy') cursor.addBusy(activity)
    else cursor.addProgress(activity)
  }, { immediate: true, flush: 'sync' })

  onScopeDispose(() => finish?.())
}
