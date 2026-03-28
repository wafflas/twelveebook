import type {
  CollectionProductNode,
  Connection,
  MerchGridItem,
  MerchProductPage,
  ProductDetailNode,
  ShopifyCartRaw,
  StorefrontCart,
} from "./types";

export function removeEdgesAndNodes<T>(connection: Connection<T>): T[] {
  return connection.edges.map((edge) => edge.node);
}

export function mapProductToMerchGridItem(node: CollectionProductNode): MerchGridItem {
  const amount = Number.parseFloat(node.priceRange.minVariantPrice.amount);
  const price = Number.isFinite(amount) ? amount : 0;
  const imageUrl = node.featuredImage?.url ?? "";

  return {
    id: node.id,
    title: node.title,
    price,
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    imageUrl,
    slug: `/merch/${node.handle}`,
    inStock: node.availableForSale,
  };
}

export function mapProductDetailToPage(node: ProductDetailNode): MerchProductPage {
  const rawImages = removeEdgesAndNodes(node.images);
  const images =
    rawImages.length > 0
      ? rawImages
      : node.featuredImage
        ? [node.featuredImage]
        : [];

  const variantNodes = removeEdgesAndNodes(node.variants);
  const variants = variantNodes.map((v) => {
    const priceAmount = Number.parseFloat(v.price.amount);
    const label =
      v.title === "Default Title"
        ? "Default"
        : v.title;
    return {
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      priceAmount: Number.isFinite(priceAmount) ? priceAmount : 0,
      currencyCode: v.price.currencyCode,
      label,
    };
  });

  const min = Number.parseFloat(node.priceRange.minVariantPrice.amount);
  const max = Number.parseFloat(node.priceRange.maxVariantPrice.amount);

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    descriptionHtml: node.descriptionHtml,
    description: node.description,
    availableForSale: node.availableForSale,
    images,
    variants,
    priceMin: Number.isFinite(min) ? min : 0,
    priceMax: Number.isFinite(max) ? max : 0,
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
  };
}

export function reshapeCart(cart: ShopifyCartRaw): StorefrontCart {
  const currencyCode = cart.cost.totalAmount.currencyCode;
  const totalTaxAmount = cart.cost.totalTaxAmount ?? {
    amount: "0.0",
    currencyCode,
  };

  const lines = removeEdgesAndNodes(cart.lines).map((line) => ({
    id: line.id,
    quantity: line.quantity,
    merchandiseId: line.merchandise.id,
    variantTitle: line.merchandise.title,
    productTitle: line.merchandise.product.title,
    productHandle: line.merchandise.product.handle,
    imageUrl: line.merchandise.product.featuredImage?.url ?? null,
    lineTotal: line.cost.totalAmount,
  }));

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: {
      subtotalAmount: cart.cost.subtotalAmount,
      totalAmount: cart.cost.totalAmount,
      totalTaxAmount,
    },
    lines,
  };
}