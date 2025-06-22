"use client";

import { forwardRef, JSX } from "react";
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import {
  BeautifulMentionsPlugin,
  BeautifulMentionNode,
  BeautifulMentionsTheme,
  BeautifulMentionsMenuProps,
  BeautifulMentionsMenuItemProps,
} from "lexical-beautiful-mentions";

import {
  ParagraphNode,
  TextNode,
  DecoratorNode,
  DOMExportOutput,
  DOMConversionMap,
} from "lexical";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";

// --- 🔗 Link Matcher ---
const urlRegex = /https?:\/\/[^\s]+/g;
const urlMatcher = createLinkMatcherWithRegExp(urlRegex, (text) => text);
interface SerializedCustomLinkNode {
  type: "custom-link";
  version: 1;
  url: string;
}

// --- 🔗 Custom LinkNode (opens in new tab) ---
class CustomLinkNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "custom-link";
  }

  static clone(node: CustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(node.__url, node.__key);
  }

  static importJSON(serializedNode: SerializedCustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(serializedNode.url);
  }

  exportJSON(): SerializedCustomLinkNode {
    return {
      type: "custom-link",
      version: 1,
      url: this.__url,
    };
  }

  constructor(private __url: string, key?: string) {
    super(key);
  }

  decorate(): JSX.Element {
    return (
      <a
        href={this.__url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 underline hover:text-blue-900"
      >
        {this.getTextContent()}
      </a>
    );
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): null | DOMConversionMap {
    return null;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("a");
    element.href = this.__url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
    element.textContent = this.getTextContent();
    return { element };
  }

  isInline(): boolean {
    return true;
  }
}

// --- 🙋 Mentions config ---
const mentionItems = {
  "@": ["Alice", "Bob", "Charlie"],
  "#": ["react", "lexical", "web"],
};

const mentionTheme: BeautifulMentionsTheme = {
  "@": "px-1 text-blue-600 font-semibold bg-blue-50 rounded",
  "@Focused": "px-1 text-blue-600 font-semibold bg-blue-200 rounded",
  "#": "px-1 text-teal-500 font-semibold bg-teal-50 rounded",
  "#Focused": "px-1 text-teal-500 font-semibold bg-teal-200 rounded",
};

// --- 📋 Custom mentions menu ---
const CustomMenu = forwardRef<HTMLUListElement, BeautifulMentionsMenuProps>(
  ({ children, ...props }, ref) => {
    const { loading, ...restProps } = props as Record<string, unknown>;
    return (
      <ul
        ref={ref}
        className="z-10 max-h-60 w-52 overflow-auto rounded border bg-white shadow p-1"
        {...(restProps as React.HTMLAttributes<HTMLUListElement>)}
      >
        {children}
      </ul>
    );
  }
);
CustomMenu.displayName = "CustomMenu";

const CustomMenuItem = forwardRef<
  HTMLLIElement,
  BeautifulMentionsMenuItemProps
>(({ item, selected, ...props }, ref) => {
  const { itemValue, loading, ...restProps } = props as Record<string, unknown>;

  return (
    <li
      ref={ref}
      className={`px-3 py-1 cursor-pointer rounded ${
        selected ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
      {...(restProps as React.HTMLAttributes<HTMLLIElement>)}
    >
      {item.value}
    </li>
  );
});
CustomMenuItem.displayName = "CustomMenuItem";

// --- ⚙️ Lexical Config ---
const initialConfig: InitialConfigType = {
  namespace: "LexicalEditor",
  onError: console.error,
  theme: {
    link: "text-blue-700 underline hover:text-blue-900",
    beautifulMentions: mentionTheme,
  },
  nodes: [
    ParagraphNode,
    TextNode,
    AutoLinkNode,
    LinkNode,
    CustomLinkNode,
    BeautifulMentionNode,
  ],
};

// --- 🧠 Editor Component ---
export default function RichEditor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative w-full max-w-2xl">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[150px] border border-gray-300 rounded-lg p-3 text-base outline-none whitespace-pre-wrap [&_a]:pointer-events-auto" />
          }
          placeholder={
            <div className="text-gray-400 absolute top-3 left-3 pointer-events-none">
              Type @mention, #tag, or URL…
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <AutoLinkPlugin matchers={[urlMatcher]} />
        <LinkPlugin />

        <BeautifulMentionsPlugin
          items={mentionItems}
          menuComponent={CustomMenu}
          menuItemComponent={CustomMenuItem}
        />

        <HistoryPlugin />

        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const root = editor.getRootElement();
              const plainText = root?.innerText || "";
              console.log("Plain text:", plainText);
            });
          }}
        />
      </div>
    </LexicalComposer>
  );
}
