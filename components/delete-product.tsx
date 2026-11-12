
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { deleteProduct } from "@/lib/actions";

export default function DeleteProductButton({
  productId,
}: {
  productId: number;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteProduct(productId);

      if (result.success) {
        toast.success(result.message);
        router.push("/products");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      className="w-full"
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
