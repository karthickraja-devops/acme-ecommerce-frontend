
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { addCartItem } from "@/lib/actions";

export default function AddToCartButton({
  productId,
}: {
  productId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleAddToCart() {
    startTransition(async () => {
      const result = await addCartItem(Number(productId), "m");

      if (result.success) {
        toast.success("Product added to cart!");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      type="button"
      className="w-full"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
