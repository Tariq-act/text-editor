"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention, {
  MentionOptions,
  SuggestionKeyDownProps,
  SuggestionProps,
} from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import tippy, { Instance } from "tippy.js";
import "tippy.js/dist/tippy.css";

const mentionList = {
  "@": ["Alice", "Bob", "Charlie"],
  "#": ["react", "tiptap", "webdev"],
};

// 🔧 Generic suggestion renderer
const renderSuggestion = (): NonNullable<
  MentionOptions["suggestion"]
>["render"] => {
  let popup: Instance[] | null = null;
  let root: HTMLDivElement;

  function update({ items, command }: SuggestionProps) {
    root.innerHTML = "";
    items.forEach((item: string) => {
      const div = document.createElement("div");
      div.className = "px-2 py-1 cursor-pointer hover:bg-gray-100";
      div.textContent = item;
      div.onclick = () => command({ id: item, label: item });
      root.appendChild(div);
    });
  }

  return {
    onStart: (props: SuggestionProps) => {
      root = document.createElement("div");
      root.className = "bg-white border rounded shadow w-48 p-1";
      update(props);

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect as DOMRect,
        appendTo: () => document.body,
        content: root,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate(props: SuggestionProps) {
      update(props);
      popup?.[0].setProps({
        getReferenceClientRect: props.clientRect as DOMRect,
      });
    },
    onKeyDown(props: SuggestionKeyDownProps) {
      if (props.event.key === "Escape") {
        popup?.[0].hide();
        return true;
      }
      return false;
    },
    onExit() {
      popup?.[0].destroy();
    },
  };
};

// ✨ Custom @mention extension
const CustomMention = Mention.configure({
  HTMLAttributes: {
    class: "text-blue-600 font-semibold bg-blue-50 px-1 rounded",
  },
  suggestion: {
    char: "@",
    items: ({ query }) =>
      mentionList["@"].filter((item) =>
        item.toLowerCase().startsWith(query.toLowerCase())
      ),
    render: renderSuggestion(),
  },
});

// ✨ Custom #tag extension
const CustomTag = Mention.configure({
  HTMLAttributes: {
    class: "text-teal-600 font-semibold bg-teal-50 px-1 rounded",
  },
  suggestion: {
    char: "#",
    items: ({ query }) =>
      mentionList["#"].filter((item) =>
        item.toLowerCase().startsWith(query.toLowerCase())
      ),
    render: renderSuggestion(),
  },
});

export default function TextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type @mention, #tag, or paste a link…",
      }),
      Link.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      CustomMention,
      CustomTag,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      console.log("HTML Output:", editor.getHTML());
      console.log("Text Output:", editor.getText());
    },
  });

  return (
    <div className="max-w-2xl">
      <div className="border rounded-lg p-3 min-h-[150px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
