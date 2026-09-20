import { getCollection } from 'astro:content';
import type { CollectionEntry, CollectionKey } from 'astro:content';

// Each landing section is a single-object YAML file, loaded as a one-entry
// collection. Required sections (hero, problem, faq, cta, pricing) are
// enforced by copy-lint (E002), not here. Optional sections (demo, founder)
// simply resolve to undefined when their file doesn't exist.
async function getSection<T extends CollectionKey>(
  collection: T,
): Promise<CollectionEntry<T>['data'] | undefined> {
  const entries = await getCollection(collection);
  return entries[0]?.data;
}

export const getHero = () => getSection('hero');
export const getProblem = () => getSection('problem');
export const getDemo = () => getSection('demo');
export const getHowItWorks = () => getSection('howItWorks');
export const getFounder = () => getSection('founder');
export const getPricing = () => getSection('pricing');
export const getFaq = () => getSection('faq');
export const getCta = () => getSection('cta');
export const getUi = () => getSection('ui');
