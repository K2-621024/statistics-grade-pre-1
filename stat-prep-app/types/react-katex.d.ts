declare module "react-katex" {
  import { ComponentProps } from "react";
  export const InlineMath: React.FC<{ math: string } & ComponentProps<"span">>;
  export const BlockMath: React.FC<{ math: string } & ComponentProps<"div">>;
}
