export interface Connection<T> {
    edges: Array<{ node: T }>;
  }
  
  export interface MoneyV2 {
    amount: string;
    currencyCode: string;
  }
  
  export interface MerchGridItem {
    id: string;
    title: string;
    price: number;
    currencyCode: string;
    imageUrl: string;
    slug: string;
    inStock: boolean;
  }
  
  export interface CollectionProductNode {
    id: string;
    handle: string;
    title: string;
    availableForSale: boolean;
    featuredImage: {
      url: string;
      altText: string | null;
    } | null;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
  }
  
  export interface ShopifyCollectionProductsOperation {
    data: {
      collection: {
        products: Connection<CollectionProductNode>;
      } | null;
    };
    variables: {
      handle: string;
      first: number;
    };
  }

  export interface ShopifyProductsListOperation {
    data: {
      products: Connection<CollectionProductNode>;
    };
    variables: {
      first: number;
    };
  }

  export interface ProductImageNode {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  }

  export interface ProductVariantNode {
    id: string;
    title: string;
    availableForSale: boolean;
    price: MoneyV2;
    selectedOptions: { name: string; value: string }[];
  }

  export interface ProductDetailNode {
    id: string;
    handle: string;
    title: string;
    description: string;
    descriptionHtml: string;
    availableForSale: boolean;
    options: { id: string; name: string; values: string[] }[];
    variants: Connection<ProductVariantNode>;
    images: Connection<ProductImageNode>;
    featuredImage: ProductImageNode | null;
    priceRange: {
      minVariantPrice: MoneyV2;
      maxVariantPrice: MoneyV2;
    };
  }

  export interface ShopifyProductOperation {
    data: {
      product: ProductDetailNode | null;
    };
    variables: {
      handle: string;
    };
  }

  /** Mapped for merch PDP */
  export interface MerchProductPage {
    id: string;
    handle: string;
    title: string;
    descriptionHtml: string;
    description: string;
    availableForSale: boolean;
    images: ProductImageNode[];
    variants: {
      id: string;
      title: string;
      availableForSale: boolean;
      priceAmount: number;
      currencyCode: string;
      label: string;
    }[];
    priceMin: number;
    priceMax: number;
    currencyCode: string;
  }

  export interface ShopifyCartLineNode {
    id: string;
    quantity: number;
    cost: { totalAmount: MoneyV2 };
    merchandise: {
      id: string;
      title: string;
      selectedOptions: { name: string; value: string }[];
      product: {
        handle: string;
        title: string;
        featuredImage: { url: string; altText: string | null } | null;
      };
    };
  }

  export interface ShopifyCartRaw {
    id: string;
    checkoutUrl: string;
    cost: {
      subtotalAmount: MoneyV2;
      totalAmount: MoneyV2;
      totalTaxAmount: MoneyV2 | null;
    };
    lines: Connection<ShopifyCartLineNode>;
    totalQuantity: number;
  }

  export interface StorefrontCart {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    cost: {
      subtotalAmount: MoneyV2;
      totalAmount: MoneyV2;
      totalTaxAmount: MoneyV2;
    };
    lines: StorefrontCartLine[];
  }

  export interface StorefrontCartLine {
    id: string;
    quantity: number;
    merchandiseId: string;
    variantTitle: string;
    productTitle: string;
    productHandle: string;
    imageUrl: string | null;
    lineTotal: MoneyV2;
  }

  export interface ShopifyCartOperation {
    data: { cart: ShopifyCartRaw | null };
    variables: { cartId: string };
  }

  export interface ShopifyCreateCartOperation {
    data: { cartCreate: { cart: ShopifyCartRaw } };
    variables: {
      lineItems?: { merchandiseId: string; quantity: number }[];
    };
  }

  export interface ShopifyAddToCartOperation {
    data: { cartLinesAdd: { cart: ShopifyCartRaw } };
    variables: {
      cartId: string;
      lines: { merchandiseId: string; quantity: number }[];
    };
  }

  export interface ShopifyRemoveFromCartOperation {
    data: { cartLinesRemove: { cart: ShopifyCartRaw } };
    variables: { cartId: string; lineIds: string[] };
  }

  export interface ShopifyUpdateCartOperation {
    data: { cartLinesUpdate: { cart: ShopifyCartRaw } };
    variables: {
      cartId: string;
      lines: { id: string; merchandiseId: string; quantity: number }[];
    };
  }