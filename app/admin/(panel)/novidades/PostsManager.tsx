"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { HiddenBadge } from "@/components/admin/HiddenBadge";
import { formatDate } from "@/lib/format";
import { PostForm } from "./PostForm";
import { createPost, deletePost, updatePost } from "./actions";

/** Nothing open, creating, or editing a post. */
type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; post: Post; notice?: string };

/** A one-word label for what the post carries, for the list subline. */
function mediaLabel(post: Post): string {
  const parts: string[] = [];
  if (post.image_url) parts.push("Foto");
  if (post.embed_url) parts.push("Vídeo/Link");
  if (post.text) parts.push("Texto");
  return parts.length > 0 ? parts.join(" · ") : "Sem conteúdo";
}

/**
 * The posts list plus the create/edit window, mirroring StoresManager. The
 * list includes hidden posts (loaded with the admin token), marked "Oculto".
 */
export function PostsManager({
  posts,
  initialCreate = false,
}: {
  posts: Post[];
  /** Open the create window on arrival (from the public site's "+" card). */
  initialCreate?: boolean;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(
    initialCreate ? { mode: "create" } : { mode: "closed" },
  );

  // The `?novo` deep link has done its job once the create window is open, so
  // strip the param — otherwise a refresh would reopen a window the admin had
  // closed. (No setState here, so this stays clear of the effect lint rule.)
  useEffect(() => {
    if (initialCreate) router.replace("/admin/novidades", { scroll: false });
    // Runs once on mount: the deep link only matters on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editingPost =
    modal.mode === "edit"
      ? (posts.find((p) => p.id === modal.post.id) ?? modal.post)
      : undefined;

  /**
   * Creating with a photo is one action, but a create followed by an upload.
   * Everything through: close. Photo left behind: reopen on the saved post,
   * explain, and let it be retried — the post itself is safe either way.
   */
  function afterCreate(post: Post, photoFailed: boolean) {
    if (!photoFailed) {
      setModal({ mode: "closed" });
      return;
    }
    setModal({
      mode: "edit",
      post,
      notice:
        "Publicação criada, mas a fotografia não foi enviada. Pode tentar de novo aqui.",
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Novidades</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {posts.length}{" "}
            {posts.length === 1 ? "publicação" : "publicações"}, incluindo as que
            não estão visíveis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep"
        >
          Adicionar publicação
        </button>
      </div>

      {posts.length > 0 ? (
        <ul className="mt-6 max-h-[60vh] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-white">
          {posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              onEdit={() => setModal({ mode: "edit", post })}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">
          Ainda não há publicações. Crie a primeira acima.
        </p>
      )}

      <Modal
        open={modal.mode !== "closed"}
        title={modal.mode === "edit" ? "Editar publicação" : "Nova publicação"}
        onClose={() => setModal({ mode: "closed" })}
      >
        {modal.mode === "create" && (
          <PostForm
            action={createPost}
            submitLabel="Criar publicação"
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={afterCreate}
          />
        )}

        {modal.mode === "edit" && editingPost && (
          <PostForm
            // Remount when switching post so the fields reset.
            key={editingPost.id}
            post={editingPost}
            action={updatePost}
            submitLabel="Guardar alterações"
            notice={modal.notice}
            onCancel={() => setModal({ mode: "closed" })}
            onSaved={() => setModal({ mode: "closed" })}
          />
        )}
      </Modal>
    </>
  );
}

/** One post in the list: thumbnail, title, date and what it carries. */
function PostRow({ post, onEdit }: { post: Post; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(post.id));
      const result = await deletePost(formData);
      setConfirming(false);
      if (result.error) setError(result.error);
    });
  }

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            className="h-12 w-16 rounded-lg border border-line object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-16 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-soft"
          >
            Sem foto
          </div>
        )}

        <div className="min-w-56 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{post.title}</span>
            {!post.is_active && <HiddenBadge />}
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            {formatDate(post.created_at)} · {mediaLabel(post)}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-primary hover:text-primary"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
        >
          Apagar
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        title={`Apagar "${post.title}"?`}
        description="Esta ação não pode ser anulada e remove também a fotografia. Para a esconder do site sem a perder, edite-a e desligue 'Visível no site'."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}
