<script setup lang="ts">
import { projects } from '~/data/projects'
import { site } from '~/data/site'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const list = useMessageList()

const slug = computed(() => String(route.params.slug))
const project = useLocalizedProject(slug)
const { detail } = useProjects()

if (!project.value?.detail) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const p = computed(() => project.value!)
const base = computed(() => `projects.${slug.value}`)

const { prev, next } = adjacentDetailProjects(projects, slug.value)
const adjacent = computed(() => ({
  prev: prev ? (detail.value.find(d => d.slug === prev.slug) ?? null) : null,
  next: next ? (detail.value.find(d => d.slug === next.slug) ?? null) : null
}))

const sections = ['problem', 'solution', 'architecture', 'results', 'lessons']

const metrics = computed(() =>
  (p.value.metrics ?? []).map(m => ({
    key: m.key,
    value: t(`${base.value}.metrics.${m.key}.value`),
    label: t(`${base.value}.metrics.${m.key}.label`)
  }))
)
const lessons = computed(() => list(`${base.value}.lessons`))

const gallery = computed(() => p.value.media?.gallery)
const shots = computed(() => gallery.value?.slice(0, 2))
const moreImages = computed(() => gallery.value?.slice(2) ?? [])

usePageSeo(() => ({
  title: `${p.value.title} — ${site.name}`,
  description: p.value.summary,
  ogSubtitle: p.value.summary
}))
</script>

<template>
  <div v-if="project">
    <header class="gridbg border-b border-border">
      <div class="container-page flex flex-col gap-7 py-12 md:py-[72px]">
        <p class="font-mono text-sm text-muted">
          <NuxtLink :to="localePath('/projects')" class="hover:text-accent">{{ t('project.breadcrumb') }}</NuxtLink>
          / <span class="text-accent">{{ p.slug }}</span>
        </p>
        <h1 class="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-6xl xl:text-[4.5rem]">{{ p.title }}</h1>
        <p class="max-w-[760px] text-lg leading-[1.6] text-muted md:text-xl">{{ p.summary }}</p>
        <dl class="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface text-[15px] lg:grid-cols-4">
          <div class="flex flex-col gap-2 border-b border-r border-border px-6 py-5 lg:border-b-0">
            <dt class="font-mono text-xs text-muted">{{ t('project.role') }}</dt>
            <dd>{{ p.role }}</dd>
          </div>
          <div class="flex flex-col gap-2 border-b border-border px-6 py-5 lg:border-b-0 lg:border-r">
            <dt class="font-mono text-xs text-muted">{{ t('project.duration') }}</dt>
            <dd>{{ t(`${base}.duration`) }}</dd>
          </div>
          <div class="flex flex-col gap-2 border-r border-border px-6 py-5">
            <dt class="font-mono text-xs text-muted">{{ t('project.type') }}</dt>
            <dd>{{ t(`project.types.${p.meta.type}`) }}</dd>
          </div>
          <div class="flex flex-col gap-2 px-6 py-5">
            <dt class="font-mono text-xs text-muted">{{ t('project.stack') }}</dt>
            <dd>{{ p.stack.join(' · ') }}</dd>
          </div>
        </dl>
        <div class="flex flex-wrap gap-3.5 font-mono text-[15px]">
          <UiExternalLink
            v-if="p.links.demo"
            :href="p.links.demo"
            class="inline-flex min-h-[50px] items-center rounded-md bg-accent px-6 font-semibold text-accent-fg hover:opacity-90"
          >
            {{ t('project.liveDemo') }}
          </UiExternalLink>
          <UiExternalLink
            v-if="p.links.code"
            :href="p.links.code"
            class="inline-flex min-h-[50px] items-center rounded-md border border-border-strong px-6 transition-colors hover:border-accent hover:text-accent"
          >
            {{ t('project.codeOnGithub') }}
          </UiExternalLink>
        </div>
      </div>
    </header>

    <section class="border-b border-border">
      <div class="container-page py-10 md:py-16">
        <ProjectVideoPlayer :src="p.media?.video" :poster="p.media?.poster" :title="p.title" />
      </div>
    </section>

    <section class="border-b border-border">
      <div class="container-page grid gap-10 py-12 md:py-[88px] lg:grid-cols-12 lg:gap-x-6">
        <aside class="lg:col-span-3">
          <ProjectToc :sections="sections" />
        </aside>
        <div class="flex max-w-[840px] flex-col gap-[72px] lg:col-span-9">
          <section id="problem" class="flex flex-col gap-4">
            <p class="font-mono text-[13px] text-accent">01 / {{ t('project.sections.problem') }}</p>
            <h2 class="text-[1.75rem] font-semibold tracking-[-0.025em] md:text-[34px]">{{ t(`${base}.problem.heading`) }}</h2>
            <p class="text-[17px] leading-[1.75] text-text-2">{{ t(`${base}.problem.body`) }}</p>
          </section>

          <section id="solution" class="flex flex-col gap-4">
            <p class="font-mono text-[13px] text-accent">02 / {{ t('project.sections.solution') }}</p>
            <h2 class="text-[1.75rem] font-semibold tracking-[-0.025em] md:text-[34px]">{{ t(`${base}.solution.heading`) }}</h2>
            <p class="text-[17px] leading-[1.75] text-text-2">{{ t(`${base}.solution.body`) }}</p>
            <ProjectGallery :slug="p.slug" :images="shots" :placeholders="2" :cols="2" />
          </section>

          <section id="architecture" class="flex flex-col gap-4">
            <p class="font-mono text-[13px] text-accent">03 / {{ t('project.sections.architecture') }}</p>
            <h2 class="text-[1.75rem] font-semibold tracking-[-0.025em] md:text-[34px]">{{ t('project.architectureHeading') }}</h2>
            <ProjectPipelineDiagram v-if="p.pipeline" :pipeline="p.pipeline" labels framed />
            <p class="text-[17px] leading-[1.75] text-text-2">{{ t(`${base}.architecture.body`) }}</p>
          </section>

          <section id="results" class="flex flex-col gap-4">
            <p class="font-mono text-[13px] text-accent">04 / {{ t('project.sections.results') }}</p>
            <h2 class="text-[1.75rem] font-semibold tracking-[-0.025em] md:text-[34px]">{{ t('project.resultsHeading') }}</h2>
            <ProjectMetricGrid v-if="metrics.length" :metrics="metrics" />
          </section>

          <section id="lessons" class="flex flex-col gap-4">
            <p class="font-mono text-[13px] text-accent">05 / {{ t('project.sections.lessons') }}</p>
            <h2 class="text-[1.75rem] font-semibold tracking-[-0.025em] md:text-[34px]">{{ t('project.lessonsHeading') }}</h2>
            <ul class="flex list-disc flex-col gap-2.5 pl-5 text-[17px] leading-[1.7] text-text-2">
              <li v-for="lesson in lessons" :key="lesson">{{ lesson }}</li>
            </ul>
          </section>
        </div>
      </div>
    </section>

    <section v-if="!gallery || moreImages.length" class="border-b border-border">
      <div class="container-page flex flex-col gap-6 py-12 md:py-[88px]">
        <h2 class="font-mono text-[13px] font-normal text-accent">{{ t('project.gallery') }}</h2>
        <ProjectGallery :slug="p.slug" :images="gallery ? moreImages : []" :placeholders="3" />
      </div>
    </section>

    <section class="gridbg">
      <div class="container-page py-12 md:py-[72px]">
        <ProjectNav :prev="adjacent.prev" :next="adjacent.next" />
      </div>
    </section>
  </div>
</template>
