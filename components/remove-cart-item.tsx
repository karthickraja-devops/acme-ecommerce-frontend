
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { removeCartItem } from "@/lib/actions";

export default function RemoveCartItem({
  cartItemId,
}: {
  cartItemId: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeCartItem(cartItemId);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="text-red-600 text-sm disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
  );
}
