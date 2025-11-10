import Post from "@/components/Post";
import { Metadata } from "next";
import { getPosts } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Twelveebook | Home",
  description: "0.twelveebook.com",
};

export default async function Home() {
  // const posts: PostType[] = [
  //   {
  //     id: "p1",
  //     author: { name: "Twelvee", avatar: "/avatars/twelvee.png" },
  //     title: "Post 1",
  //     content: "2012 erxete to nouuuuu ;ppppp",
  //     timestamp: "about a minute ago",
  //     comments: 5,
  //   },
  //   {
  //     id: "p2",
  //     author: { name: "Twelvee", avatar: "/avatars/twelvee.png" },
  //     title: "Post 2",
  //     content: "feeling excited for liveara avrio sto bums tagamame ola xD",
  //     timestamp: "6 minutes ago",
  //     comments: 3,
  //   },
  //   {
  //     id: "p3",
  //     author: { name: "Twelvee", avatar: "/avatars/twelvee.png" },
  //     title: "Post 3",
  //     content: "tospasate to track guys looool das crazy :)",
  //     timestamp: "about an hour ago",
  //     comments: 8,
  //   },
  //   {
  //     id: "p4",
  //     author: { name: "Stolou", avatar: "/avatars/stolou.png" },
  //     title: "Post 4",
  //     content: "molis poulhsa ena beat 300 euro bro xa0xa0xa0ax0a0",
  //     timestamp: "2 hours ago",
  //     comments: 12,
  //   },
  //   {
  //     id: "p5",
  //     author: { name: "Xix", avatar: "/avatars/xix.png" },
  //     title: "Post 5",
  //     content:
  //       "dimosia vgeno kai krazw to tsimpuki ton stolou dedinei fragko xddddd Stolou",
  //     timestamp: "25 December 2012",
  //     comments: 4,
  //   },
  //   {
  //     id: "p6",
  //     author: { name: "Gxhan", avatar: "/avatars/gxhan.png" },
  //     title: "Post 6",
  //     content: "magkes de vgeni i fasi xoris dreads ime diskola ;pp",
  //     timestamp: "20 December 2012",
  //     comments: 9,
  //   },
  //   {
  //     id: "p7",
  //     author: { name: "Rsk in Kozani, Greece", avatar: "/avatars/rsk.png" },
  //     title: "Post 7",
  //     content: "gamaei h kozani ko kai zani xa0xa0x0ax0ax0ax0",
  //     timestamp: "20 December 2012",
  //     comments: 6,
  //   },
  //   {
  //     id: "p8",
  //     author: { name: "Xxhtos", avatar: "/avatars/xxhtos.png" },
  //     title: "Post 8",
  //     content:
  //       "feeling heartbroken kai kano gures gurw apo sena a aa aa a a :))))))))))))",
  //     timestamp: "20 December 2012",
  //     comments: 15,
  //   },
  // ];

  const posts = await getPosts(); // Contentful

  return (
    <div className="bg-white p-2 text-black">
      <h1 className="mb-4 text-2xl font-bold">News Feed</h1>
      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
