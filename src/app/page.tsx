
import TextEditor from "@/components/text-editor-v2";

import RichEditor from "@/components/text-editor";


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center mt-10">

      <TextEditor />

      <RichEditor />

    </div>
  );
}
