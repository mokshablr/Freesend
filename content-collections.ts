import {
  defineCollection,
  defineConfig,
  type Context,
  type Meta,
} from "@content-collections/core";
import { compileMDX, type Options as MDXOptions } from "@content-collections/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { z } from "zod";

/* -------------------------------------------------------------------------
 * MDX pipeline, carried over verbatim from the previous contentlayer.config.ts.
 *
 * The ORDER of the rehype plugins is load-bearing. Visitor A stashes the raw
 * code text on the <pre> hast node OUTSIDE of node.properties; rehype-pretty-code
 * then mutates that same node object in place into a <figure>; visitor B moves
 * the value INTO the inner <pre>'s properties, which is what makes the
 * hast-to-JSX conversion emit it as a real prop. Reordering or dropping either
 * visitor silently removes the code-block copy button, because the consumer in
 * components/content/mdx-components.tsx guards on `__rawString__ && ...`.
 * ---------------------------------------------------------------------- */

const remarkPlugins: NonNullable<MDXOptions["remarkPlugins"]> = [remarkGfm];

// Annotated so the [plugin, options] tuples keep their tuple type instead of
// widening to an array, which does not satisfy Pluggable.
const rehypePlugins: NonNullable<MDXOptions["rehypePlugins"]> = [
  rehypeSlug,

  // Visitor A: stash the un-highlighted source on the node itself.
  () => (tree: any) => {
    visit(tree, (node: any) => {
      if (node?.type === "element" && node?.tagName === "pre") {
        const [codeEl] = node.children;

        if (codeEl.tagName !== "code") return;

        node.__rawString__ = codeEl.children?.[0].value;
      }
    });
  },

  [
    rehypePrettyCode,
    {
      theme: "github-dark",
      keepBackground: false,
      onVisitLine(node: any) {
        // Prevent lines from collapsing in `display: grid` mode, and allow empty lines to be copy/pasted
        if (node.children.length === 0) {
          node.children = [{ type: "text", value: " " }];
        }
      },
    },
  ],

  // Visitor B: move it into properties so it survives as a JSX prop.
  () => (tree: any) => {
    visit(tree, (node: any) => {
      if (node?.type === "element" && node?.tagName === "figure") {
        if (!("data-rehype-pretty-code-figure" in node.properties)) {
          return;
        }

        const preElement = node.children.at(-1);
        if (preElement.tagName !== "pre") {
          return;
        }

        preElement.properties["__rawString__"] = node.__rawString__;
      }
    });
  },

  [
    rehypeAutolinkHeadings,
    {
      properties: {
        className: ["subheading-anchor"],
        ariaLabel: "Link to section",
      },
    },
  ],
];

/* -------------------------------------------------------------------------
 * Shared computed fields, reproducing contentlayer's defaultComputedFields.
 * ---------------------------------------------------------------------- */

// Verbatim from the old config. Do not "improve" this regex: its results are
// compared by exact string equality against the <Image src> values in
// components/content/mdx-components.tsx before being handed to BlurImage.
const IMAGE_SRC_RE = /(?<=<Image[^>]*\bsrc=")[^"]+(?="[^>]*\/>)/g;

// Mirrors the `Document` shape compileMDX expects. Using core's own Meta type
// rather than hand-rolling it keeps this from drifting if fields are added.
type RawDocument = {
  _meta: Meta;
  content: string;
};

async function computedFields<T extends RawDocument>(
  document: T,
  context: Pick<Context, "cache">,
) {
  const { content, ...rest } = document;

  // _meta.path matches contentlayer's _raw.flattenedPath, but ONLY because
  // every collection uses directory:"content" with a path-prefixed include
  // glob. createPath() in core strips "index" only when it is preceded by a
  // "/", so directory:"content/docs" would yield "index" instead of "docs",
  // and every slug would silently lose its prefix. Note also that the check is
  // hard-coded to "/", so this is posix-only.
  const flattenedPath = document._meta.path;

  const code = await compileMDX(context, document, {
    remarkPlugins,
    rehypePlugins,
  });

  return {
    ...rest,
    _id: document._meta.filePath,
    slug: `/${flattenedPath}`,
    slugAsParams: flattenedPath.split("/").slice(1).join("/"),
    images: (content.match(IMAGE_SRC_RE) ?? []) as string[],
    // Keep contentlayer's { raw, code } shape so no consumer has to change:
    // body.raw feeds getTableOfContents(), body.code feeds <Mdx code={...} />.
    body: { raw: content, code },
  };
}

// contentlayer's `type: "date"` emitted a normalised ISO string, never a Date
// object. The output type must stay a string: b.date.localeCompare(a.date) runs
// in app/(marketing)/blog/page.tsx and blog/category/[slug]/page.tsx, and
// dateTime={post.date} is a string-typed DOM attribute.
//
// Never use z.coerce.date() here. It serialises as new Date(...), the build
// stays green, and /blog throws at render.
const isoDateString = z
  .union([z.string(), z.date()])
  .transform((value) => new Date(value).toISOString());

const baseFields = {
  title: z.string(),
  description: z.string().optional(),
  // Declared explicitly to avoid core's implicit-content-property warning.
  content: z.string(),
};

/* -------------------------------------------------------------------------
 * Collections. The name determines the generated export and type:
 *   "docs" -> allDocs / Doc, "posts" -> allPosts / Post, and so on.
 * ---------------------------------------------------------------------- */

const docs = defineCollection({
  name: "docs",
  directory: "content",
  include: "docs/**/*.mdx",
  schema: z.object({
    ...baseFields,
    published: z.boolean().default(true),
  }),
  transform: async (document, context) => ({
    ...(await computedFields(document, context)),
    type: "Doc" as const,
  }),
});

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "blog/**/*.mdx",
  schema: z.object({
    ...baseFields,
    date: isoDateString,
    published: z.boolean().default(true),
    image: z.string(),
    authors: z.array(z.string()),
    categories: z.array(z.enum(["news", "education"])),
    // slugAsParams values, self-joined against allPosts at render time.
    related: z.array(z.string()).optional(),
  }),
  transform: async (document, context) => ({
    ...(await computedFields(document, context)),
    type: "Post" as const,
  }),
});

const guides = defineCollection({
  name: "guides",
  directory: "content",
  include: "guides/**/*.mdx",
  schema: z.object({
    ...baseFields,
    date: isoDateString,
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
  transform: async (document, context) => ({
    ...(await computedFields(document, context)),
    type: "Guide" as const,
  }),
});

const pages = defineCollection({
  name: "pages",
  directory: "content",
  include: "pages/**/*.mdx",
  schema: z.object(baseFields),
  transform: async (document, context) => ({
    ...(await computedFields(document, context)),
    type: "Page" as const,
  }),
});

export default defineConfig({
  content: [pages, docs, guides, posts],
});
