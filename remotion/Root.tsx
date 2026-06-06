import { Composition } from "remotion";
import { PanopticonDemo } from "./PanopticonDemo";

export function RemotionRoot() {
  return (
    <Composition
      id="PanopticonDemo"
      component={PanopticonDemo}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
    />
  );
}
