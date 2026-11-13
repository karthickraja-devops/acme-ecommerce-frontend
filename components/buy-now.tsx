"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";

export default function BuyNowButton(props: { text: string }) {
  return (
    <Button
      className="w-full"
      variant="outline"
      type="button"
      onClick={() => {
        toast.info("Checkout is not available yet.");
      }}
    >
      {props.text}
    </Button>
  );
}