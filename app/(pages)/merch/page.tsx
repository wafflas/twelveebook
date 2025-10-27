import MerchGrid from '@/components/MerchGrid'
import React from 'react'

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Twelveebook | Merch",
  description: "0.twelveebook.com",
};

export default function page() {
  // TODO: Replace with CMS data
  const items: Merch[] = [
    {
      id: '1',
      title: "“2012” T- Shirt",
      price: 10,
      imageUrl: "/merch/2012-tshirt.png",
      slug: "/merch/2012-tshirt",
      inStock: true,
    },
    {
      id: '2',
      title: "“2012” Hoodie",
      price: 20,
      imageUrl: "/merch/2012-hoodie.png",
      slug: "/merch/2012-hoodie",
      inStock: true,
    },
    {
      id: '3',
      title: "“2012” CD",
      price: 20,
      imageUrl: "/merch/2012-cd.png",
      slug: "/merch/2012-cd",
      inStock: true,
    },
    {
      id: '4',
      title: "“2012” Hat",
      price: 20,
      imageUrl: "/merch/2012-hat.png",
      slug: "/merch/2012-hat",
      inStock: true,
    },
    {
      id: '5',
      title: "“2012” Pants",
      price: 20,
      imageUrl: "/merch/2012-pants.png",
      slug: "/merch/2012-pants",
      inStock: true,
    },
  ];

  return (
    <div className="container mx-auto bg-white p-2 text-black">
      <h1 className="text-2xl font-bold pb-5">Merchandise</h1>
      <MerchGrid items={items} />
    </div>
  );
}