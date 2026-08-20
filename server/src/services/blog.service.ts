import { BlogPost } from "../models/blog-post.model";
import { ApiError } from "../utils/api-error.util";
import { slugify, uniqueSlug } from "../utils/slug.util";
import { escapeRegex } from "../utils/pagination.util";
import { getSellerPlan, getSellerStore, planAllowsBlog } from "./store-helper.service";

async function assertBlog(sellerId: string) {
  const store = await getSellerStore(sellerId);
  const plan = await getSellerPlan(sellerId);
  if (!planAllowsBlog(plan?.name ?? "free")) {
    throw ApiError.forbidden("Blog is available on Pro and Pro+ plans");
  }
  return store;
}

export async function createPost(sellerId: string, payload: Record<string, unknown>) {
  const store = await assertBlog(sellerId);
  const title = String(payload.title);
  const slug = await uniqueSlug(title, async (s) =>
    Boolean(await BlogPost.exists({ storeId: store._id, slug: s })),
  );
  return BlogPost.create({
    storeId: store._id,
    sellerId,
    title,
    slug,
    content: payload.content ?? "",
    excerpt: payload.excerpt ?? "",
    coverImage: payload.coverImage ?? "",
    tags: payload.tags ?? [],
    status: "draft",
    metaTitle: payload.metaTitle ?? "",
    metaDescription: payload.metaDescription ?? "",
  });
}

export async function listPosts(
  sellerId: string,
  query: { status?: string; search?: string; skip: number; limit: number },
) {
  const store = await assertBlog(sellerId);
  const filter: Record<string, unknown> = { storeId: store._id };
  if (query.status) filter.status = query.status;
  if (query.search) filter.title = new RegExp(escapeRegex(query.search), "i");
  const [items, total] = await Promise.all([
    BlogPost.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    BlogPost.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getPost(sellerId: string, postId: string) {
  const store = await assertBlog(sellerId);
  const post = await BlogPost.findOne({ _id: postId, storeId: store._id });
  if (!post) throw ApiError.notFound("Post not found");
  return post;
}

export async function updatePost(sellerId: string, postId: string, payload: Record<string, unknown>) {
  const post = await getPost(sellerId, postId);
  const allowed = ["title", "content", "excerpt", "coverImage", "tags", "metaTitle", "metaDescription"];
  for (const key of allowed) {
    if (payload[key] !== undefined) (post as unknown as Record<string, unknown>)[key] = payload[key];
  }
  if (payload.title) {
    post.slug = await uniqueSlug(slugify(String(payload.title)), async (s) =>
      Boolean(await BlogPost.exists({ storeId: post.storeId, slug: s, _id: { $ne: post._id } })),
    );
  }
  await post.save();
  return post;
}

export async function publishPost(sellerId: string, postId: string) {
  const post = await getPost(sellerId, postId);
  post.status = "published";
  post.publishedAt = new Date();
  await post.save();
  return post;
}

export async function unpublishPost(sellerId: string, postId: string) {
  const post = await getPost(sellerId, postId);
  post.status = "draft";
  await post.save();
  return post;
}

export async function archivePost(sellerId: string, postId: string) {
  const post = await getPost(sellerId, postId);
  post.status = "archived";
  await post.save();
  return post;
}
