'use client';

import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnUnderline,
  BtnUndo,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
} from 'react-simple-wysiwyg';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder = 'Write description...' }: RichTextEditorProps) {
  return (
    <EditorProvider>
      <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
        <Toolbar>
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnStrikeThrough />
          <Separator />
          <BtnBulletList />
          <BtnNumberedList />
          <Separator />
          <BtnLink />
          <Separator />
          <BtnUndo />
          <BtnRedo />
        </Toolbar>

        <Editor
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[140px] bg-white text-sm dark:bg-slate-800 dark:text-slate-100"
          containerProps={{
            style: {
              minHeight: '140px',
            },
          }}
        />
      </div>
    </EditorProvider>
  );
}
