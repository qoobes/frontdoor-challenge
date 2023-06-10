import { defineConfig } from "@twind/core";
import presetAutoprefix from "@twind/preset-autoprefix";
import presetTailwind from "@twind/preset-tailwind";

export default defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
  theme: {
    extend: {
      fontFamily: {
        space: ["'Space Grotesk', sans-serif"],
        sans: ["'Space Grotesk', sans-serif"],
      },
    },
  },
});
