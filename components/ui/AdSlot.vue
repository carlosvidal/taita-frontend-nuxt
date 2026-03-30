<template>
  <div v-if="shouldShow" class="ad-slot my-6">
    <div class="text-center">
      <!-- AdSense auto ad unit -->
      <ins
        class="adsbygoogle"
        :style="adStyle"
        :data-ad-client="publisherId"
        :data-ad-slot="slot"
        :data-ad-format="format"
        data-full-width-responsive="true"
      ></ins>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AdSlot component — renders an AdSense ad unit.
 *
 * Placement options:
 * - "banner"     : Horizontal banner (between posts, top of page)
 * - "in-article" : Within post content
 * - "sidebar"    : Sidebar rectangle
 *
 * Rules:
 * - No ads for Premium subscribers
 * - FREE plan: platform ads
 * - PRO plan: author's own ads (or no ads if no AdSense ID)
 */
const props = withDefaults(defineProps<{
  placement?: 'banner' | 'in-article' | 'sidebar';
  slot?: string;
}>(), {
  placement: 'banner',
  slot: '',
});

const { isPremium } = useSubscriber();

const publisherId = useState<string | null>('adsPublisherId', () => null);

const shouldShow = computed(() => {
  // No ads for premium subscribers
  if (isPremium.value) return false;
  // No ads if no publisher ID loaded
  if (!publisherId.value) return false;
  return true;
});

const format = computed(() => {
  switch (props.placement) {
    case 'in-article': return 'fluid';
    case 'sidebar': return 'rectangle';
    default: return 'auto';
  }
});

const adStyle = computed(() => {
  switch (props.placement) {
    case 'sidebar': return 'display:inline-block;width:300px;height:250px';
    case 'in-article': return 'display:block;text-align:center';
    default: return 'display:block';
  }
});

// Push ad when component mounts on client
onMounted(() => {
  if (shouldShow.value && typeof window !== 'undefined') {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {
      // AdSense not loaded yet, ignore
    }
  }
});
</script>

<style scoped>
.ad-slot {
  min-height: 50px;
  overflow: hidden;
}
</style>
