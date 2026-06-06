declare module "remotion" {
  import type { CSSProperties, FC, ReactNode } from "react";

  export const AbsoluteFill: FC<{ children?: ReactNode; style?: CSSProperties }>;
  export const Composition: FC<{
    id: string;
    component: FC<Record<string, never>>;
    durationInFrames: number;
    fps: number;
    width: number;
    height: number;
  }>;
  export function registerRoot(component: FC<Record<string, never>>): void;
  export function useCurrentFrame(): number;
  export function useVideoConfig(): { fps: number; width: number; height: number; durationInFrames: number };
  export function interpolate(
    input: number,
    inputRange: number[],
    outputRange: number[],
    options?: { extrapolateLeft?: "clamp"; extrapolateRight?: "clamp" }
  ): number;
  export function spring(options: { frame: number; fps: number; config?: Record<string, number> }): number;
}
