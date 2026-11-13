"use client";

import { Button } from "./ui/button";
import { toast } from "sonner";

export default function PlaceOrderButton() {
  return (
    <Button
      type="button"
      className="w-full"
      onClick={() => {
        toast.info("Order checkout is not available yet.");
      }}
    >
      Place Order
    </Button>
  );
}