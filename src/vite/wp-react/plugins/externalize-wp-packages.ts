import rollupGlobals from "rollup-plugin-external-globals";
import { PluginOption } from "vite";
import { WP_EXTERNAL_PACKAGES } from "../utils/index.js";
import viteExternal from "vite-plugin-external";

/**
 * Updates the vite config to externalize all WordPress packages.
 */
export const externalizeWpPackages = (): PluginOption => {
  return [
    {
      name: "my-vite:externalize-wp-packages",
      enforce: "pre",
      config() {
        return {
          build: {
            rollupOptions: {
              external: Object.keys(WP_EXTERNAL_PACKAGES),
              plugins: [
                /**
                 * Add the plugin to rollup to ensure react imports don't end up in the bundle
                 * framer-motion causes the issue by using namespace imports
                 *
                 * @see https://github.com/vitejs/vite-plugin-react/issues/3
                 */
                rollupGlobals(WP_EXTERNAL_PACKAGES),
              ],
            },
          },
        };
      },
    },
    // // @ts-ignore - viteExternal is not typed well
    viteExternal({
      externals: WP_EXTERNAL_PACKAGES,
    }),
  ];
};
