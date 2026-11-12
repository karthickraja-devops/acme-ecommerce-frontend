
"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { formatUSD } from "@/lib/utils";
import { addCartItem } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import DeleteProductButton from "./delete-product";

export default function ProductCard({
  product,
}: {
  product: {
    id: string;
    imageSrc: string;
    imageAlt: string;
    title: string;
    price: number;
    slug: string;
  };
}) {
  const { id, imageSrc, imageAlt, title, price, slug } = product;

  const [isPending, startTransition] = useTransition();

  function handleAddToCart() {
    startTransition(async () => {
      const result = await addCartItem(Number(id), null);

      if (result.success) {
        toast.success("Product added to your cart!");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-0 border border-gray-200 rounded-lg shadow-lg">
      {imageSrc && (
        <Image
          alt={imageAlt}
          className="object-cover rounded-t-lg bg-slate-300 w-full"
          height={350}
          width={350}
          src={imageSrc}
        />
      )}

      <div className="flex flex-col p-4 space-y-4 items-center w-full">
        <h3 className="text-lg font-semibold">{title}</h3>

        <p className="text-gray-500">{formatUSD(price)}</p>

        <Link
          prefetch={true}
          className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 w-full"
          href={`/product/${slug}`}
        >
          View Product
        </Link>

        <Button
          type="button"
          className="w-full"
          onClick={handleAddToCart}
          disabled={isPending}
        >
          {isPending ? "Adding..." : "Add to Cart"}
        </Button>

        <DeleteProductButton productId={Number(id)} />
      </div>
    </div>
  );
}
