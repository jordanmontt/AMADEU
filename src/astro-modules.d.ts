/**
 * Types `.astro` imports for plain TypeScript tooling (tsc, typescript-eslint).
 *
 * Astro 7 resolves `.astro` files only through its own language tooling (`astro check`), so
 * a `.ts` file that imports a component (our component tests, via the Container API) sees
 * an untyped module. This fallback declaration types such imports as an Astro component;
 * `astro check` keeps using the real component types. Remove it once Astro ships an
 * equivalent declaration (logged as an upstream issue candidate, 2026-11-24).
 */
declare module '*.astro' {
  type AstroComponent = Parameters<
    import('astro/container').experimental_AstroContainer['renderToString']
  >[0];
  const component: AstroComponent;
  export default component;
}
