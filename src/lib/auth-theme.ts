import type { Theme } from "@aws-amplify/ui-react";

/** xy ネオンマップに合わせた Amplify UI テーマ */
export const xyAuthTheme: Theme = {
  name: "xy-neon",
  tokens: {
    colors: {
      background: {
        primary: { value: "#0d0d18" },
        secondary: { value: "#12121f" },
        tertiary: { value: "#1a1a2e" },
      },
      font: {
        primary: { value: "#e5e7eb" },
        secondary: { value: "#9ca3af" },
        tertiary: { value: "#6b7280" },
        interactive: { value: "#22d3ee" },
        hover: { value: "#67e8f9" },
        focus: { value: "#a78bfa" },
        disabled: { value: "#4b5563" },
        error: { value: "#f87171" },
      },
      border: {
        primary: { value: "rgba(139, 92, 246, 0.35)" },
        secondary: { value: "rgba(139, 92, 246, 0.2)" },
        tertiary: { value: "rgba(139, 92, 246, 0.12)" },
        focus: { value: "#22d3ee" },
        error: { value: "#f87171" },
      },
      brand: {
        primary: {
          10: { value: "#1e1b4b" },
          20: { value: "#2e1065" },
          40: { value: "#5b21b6" },
          60: { value: "#7c3aed" },
          80: { value: "#8b5cf6" },
          90: { value: "#a78bfa" },
          100: { value: "#c4b5fd" },
        },
      },
    },
    radii: {
      small: { value: "0.5rem" },
      medium: { value: "0.75rem" },
      large: { value: "1rem" },
      xl: { value: "1.25rem" },
    },
    space: {
      small: { value: "0.75rem" },
      medium: { value: "1rem" },
      large: { value: "1.5rem" },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: { value: "0" },
          backgroundColor: { value: "transparent" },
          boxShadow: { value: "none" },
        },
        form: {
          padding: { value: "0" },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: "{colors.brand.primary.60}" },
          color: { value: "#ffffff" },
          _hover: {
            backgroundColor: { value: "{colors.brand.primary.80}" },
          },
          _focus: {
            backgroundColor: { value: "{colors.brand.primary.80}" },
            boxShadow: {
              value: "0 0 0 2px #0d0d18, 0 0 0 4px #22d3ee",
            },
          },
          _active: {
            backgroundColor: { value: "{colors.brand.primary.40}" },
          },
        },
        link: {
          color: { value: "{colors.font.interactive}" },
          _hover: {
            color: { value: "{colors.font.hover}" },
          },
        },
      },
      fieldcontrol: {
        borderColor: { value: "{colors.border.primary}" },
        color: { value: "{colors.font.primary}" },
        _focus: {
          borderColor: { value: "{colors.border.focus}" },
          boxShadow: { value: "0 0 0 1px #22d3ee" },
        },
      },
      tabs: {
        item: {
          color: { value: "{colors.font.secondary}" },
          _active: {
            color: { value: "{colors.font.interactive}" },
            borderColor: { value: "{colors.font.interactive}" },
          },
          _hover: {
            color: { value: "{colors.font.primary}" },
          },
        },
      },
    },
  },
};
