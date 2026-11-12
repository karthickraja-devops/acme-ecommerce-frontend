"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addCartItem(
  productId: number,
  selectedSize: string | null,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const apiUrl = process.env.NEST_API_URL;

  if (!accessToken || !apiUrl) {
    return { success: false, message: "Please log in again." };
  }

  try {
    const response = await fetch(`${apiUrl}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        productId,
        quantity: 1,
        selectedSize,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 403) {
        return {
          success: false,
          message: "You do not have permission to add products to the cart.",
        };
      }

      const error = await response.json().catch(() => null);

      return {
        success: false,
        message: error?.message || "Could not add this product to your cart.",
      };
    }

    revalidatePath("/cart");
    return { success: true, message: "Product added to your cart!" };
  } catch {
    return { success: false, message: "Could not connect to the store." };
  }
}

export async function removeCartItem(cartItemId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const apiUrl = process.env.NEST_API_URL;

  if (!accessToken || !apiUrl) {
    return { success: false, message: "Please log in again." };
  }

  try {
    const response = await fetch(`${apiUrl}/cart/items/${cartItemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return {
        success: false,
        message: error?.message || "Could not remove this item.",
      };
    }

    revalidatePath("/cart");
    return { success: true, message: "Item removed from cart." };
  } catch {
    return { success: false, message: "Could not connect to the store." };
  }
}

export async function updateCartItem(
  cartItemId: number,
  quantity: number,
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const apiUrl = process.env.NEST_API_URL;

  if (!accessToken || !apiUrl) {
    return { success: false, message: "Please log in again." };
  }

  try {
    const response = await fetch(`${apiUrl}/cart/items/${cartItemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ quantity }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return {
        success: false,
        message: error?.message || "Could not update the quantity.",
      };
    }

    revalidatePath("/cart");
    return { success: true, message: "Cart quantity updated." };
  } catch {
    return { success: false, message: "Could not connect to the store." };
  }
}


export async function deleteProduct(productId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const apiUrl = process.env.NEST_API_URL;

  if (!accessToken || !apiUrl) {
    return {
      success: false,
      message: "Please log in again.",
    };
  }

  if (!Number.isInteger(productId) || productId < 1) {
    return {
      success: false,
      message: "Invalid product ID.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      return {
        success: false,
        message:
          error?.message || "Could not delete this product.",
      };
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/product/[slug]", "page");

    return {
      success: true,
      message: "Product deleted successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Could not connect to the store.",
    };
  }
}

